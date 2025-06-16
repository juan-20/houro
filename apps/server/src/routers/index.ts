import {
  protectedProcedure, publicProcedure,
  router,
} from "../lib/trpc";
import { categoriesRouter } from "./categories";
import { timesRouter } from "./times";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.session?.userId || null,
    };
  }),
  times: timesRouter,
  category: categoriesRouter,
});
export type AppRouter = typeof appRouter;
