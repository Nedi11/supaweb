import { exampleRouter } from "./routers/example";
import { lemonRouter } from "./routers/lemonsqueezy";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  example: exampleRouter,
  lemon: lemonRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
