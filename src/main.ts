import { TRPCError, inferAsyncReturnType, initTRPC } from "@trpc/server";
import * as trpc from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import clerkRouter from "./clerk";

import { sessions } from "@clerk/clerk-sdk-node";
import Cookies from "cookies";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const createContext = async ({
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
const t = initTRPC.context<Context>().create();

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

const puclicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);

const appRouter = t.router({
  greeting: puclicProcedure.query(() => "hello nigga"),
});

const app = express();
app.use(cors());
app.use(
  "/trpc",
  trpc.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.use("/clerk", clerkRouter);

app.listen(5000);
