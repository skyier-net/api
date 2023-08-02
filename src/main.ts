import { initTRPC } from "@trpc/server";
import { createHTTPServer } from "@trpc/server/adapters/standalone";

const t = initTRPC.create();

const router = t.router;

const appRouter = router({
  greeting: t.procedure.query(() => "hello world gay"),
});

createHTTPServer({
  router: appRouter,
  createContext() {
    return {};
  },
}).listen(5000);

export type AppRouter = typeof appRouter;
