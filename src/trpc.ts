import * as trpc from "@trpc/server/adapters/express";
import jwt from "jsonwebtoken";
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { inferAsyncReturnType, initTRPC, TRPCError } from "@trpc/server";
const prisma = new PrismaClient();

export const createContext = async ({
  req,
  res,
}: trpc.CreateExpressContextOptions) => {
  const [clientToken, groupId] = req.headers.authorization
    ? req.headers.authorization!.split(" ").slice(1)
    : [null, null];

  const decoded = clientToken
    ? jwt.verify(clientToken, process.env.PEM_PUBLIC_KEY!)
    : null;

  return {
    user: decoded
      ? await prisma.user.findUnique({
          where: {
            id: decoded?.sub as string,
          },
        })
      : null,
    group: groupId
      ? await prisma.group.findUnique({
          where: {
            id: groupId,
          },
        })
      : null,
    userGroupRelation:
      groupId && decoded
        ? await prisma.userToGroupRelation.findUnique({
            where: {
              userId_groupId: {
                userId: decoded?.sub as string,
                groupId: groupId,
              },
            },
          })
        : null,
  };
};
type Context = inferAsyncReturnType<typeof createContext>;
export const t = initTRPC.context<Context>().create();

const isAuthed = t.middleware((opts) => {
  const { ctx } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return opts.next({
    ctx: {
      user: ctx.user,
    },
  });
});

const isAdmin = t.middleware(async (opts) => {
  if (!opts.ctx.user || opts.ctx.userGroupRelation?.isBanned)
    throw new TRPCError({ code: "UNAUTHORIZED" });
  if (
    opts.ctx.userGroupRelation?.role !== "ADMIN" &&
    opts.ctx.userGroupRelation?.role !== "CREATOR"
  )
    throw new TRPCError({ code: "UNAUTHORIZED" });
  return opts.next({
    ctx: {
      user: opts.ctx.user,
      role: opts.ctx.userGroupRelation?.role,
    },
  });
});

export const puclicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
export const adminProcedure = t.procedure.use(isAdmin);
