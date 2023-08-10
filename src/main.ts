import * as trpc from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import clerkRouter from "./clerk";
import { createContext } from "./trpc";
import { appRouter } from "./routers";

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

app.listen(8000);
