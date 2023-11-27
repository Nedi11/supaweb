import { Session } from "@supabase/supabase-js";
import { TRPCError, initTRPC } from "@trpc/server";
import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import { getServerSideSession } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import superjson from "superjson";
/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */

export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
  const { req } = opts;

  const { session } = await getServerSideSession(req);
  return {
    session: session,
    prisma,
    request: req,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});
/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

const enforceAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    // infers the `session` as non-nullable
    ctx: { session: { ...ctx.session, user: ctx.session.user } },
  });
});

export const protectedProcedure = t.procedure.use(enforceAuthed);
