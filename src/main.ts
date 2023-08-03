import * as trpc from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import clerkRouter from "./clerk";
import { createContext, puclicProcedure, t } from "./trpc";

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
