import { t, puclicProcedure } from "../trpc";
import { groupsRouter } from "./groups";

export const appRouter = t.router({
  groups: groupsRouter,
});
