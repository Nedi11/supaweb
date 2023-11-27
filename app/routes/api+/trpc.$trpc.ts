import { LoaderFunctionArgs } from "@remix-run/node";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "~/trpc-api";
import { createTRPCContext } from "~/trpc-api/trpc";
export function loader({ request }: LoaderFunctionArgs) {
  console.log("test");
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: createTRPCContext,
  });
}
export function action({ request }: LoaderFunctionArgs) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: createTRPCContext,
  });
}
