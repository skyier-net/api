import * as trpc from "@trpc/server/adapters/express";

import { sessions } from "@clerk/clerk-sdk-node";
import Cookies from "cookies";

import { PrismaClient } from "@prisma/client";
import { inferAsyncReturnType, initTRPC, TRPCError } from "@trpc/server";
const prisma = new PrismaClient();

export const createContext = async ({
  req,
  res,
}: trpc.CreateExpressContextOptions) => {
  const sessionId = req.query._clerk_session_id;
  const cookies = new Cookies(req, res);
  const clientToken = cookies.get("__session");

  const session = await sessions.verifySession(
    sessionId as string,
    clientToken!
  );

  return {
    user:
      (await prisma.user.findFirst({
        where: {
          id: session.userId,
        },
      })) ?? null,
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
  if (!opts.ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  const userGroupRelation = await prisma.userToGroupRelation.findUniqueOrThrow({
    where: {
      userId_groupId: {
        userId: opts.ctx.user.id,
        groupId: (opts.input as any).groupId,
      },
    },
    select: {
      role: true,
    },
  });
  if (
    userGroupRelation.role !== "ADMIN" &&
    userGroupRelation.role !== "CREATOR"
  )
    throw new TRPCError({ code: "UNAUTHORIZED" });
  return opts.next({
    ctx: {
      user: opts.ctx.user,
      role: userGroupRelation.role,
    },
  });
});

export const puclicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
export const adminProcedure = t.procedure.use(isAdmin);
