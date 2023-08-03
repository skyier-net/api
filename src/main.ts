import { inferAsyncReturnType, initTRPC } from "@trpc/server";
import * as trpc from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import clerkRouter from "./clerk";

const createContext = ({ req, res }: trpc.CreateExpressContextOptions) => ({});
type Context = inferAsyncReturnType<typeof createContext>;
const t = initTRPC.context<Context>().create();

const puclicProcedure = t.procedure;

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
