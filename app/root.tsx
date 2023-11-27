import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useHref,
  useOutletContext,
  useRevalidator,
} from "@remix-run/react";
import { env } from "$/env.mjs";
import "./styles/globals.css";
import { LoaderFunctionArgs } from "@remix-run/node";
import superjsonTransformer from "superjson";
import { superjson, useSuperLoaderData } from "./utils/superjson";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";
import { Database } from "./types/database.types";
import { getServerSideSession } from "./utils/auth.server";
import { Session, SupabaseClient } from "@supabase/supabase-js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "~/utils/api";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { Toaster } from "react-hot-toast";
export async function loader({ request }: LoaderFunctionArgs) {
  const { session, headers } = await getServerSideSession(request);

  return superjson(
    {
      SUPABASE_URL: env.SUPABASE_URL,
      SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY,
      session,
    },
    {
      headers: headers,
    }
  );
}

type ContextType = {
  supabase: SupabaseClient<Database>;
  session: Session | null;
};

export default function App() {
  //__AUTH__
  const { SUPABASE_ANON_KEY, SUPABASE_URL, session } =
    useSuperLoaderData<typeof loader>();
  const { revalidate } = useRevalidator();
  const [supabase] = useState(() =>
    createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
  );
  const serverAccessToken = session?.access_token;
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        event !== "INITIAL_SESSION" &&
        session?.access_token !== serverAccessToken
      ) {
        // server and client are out of sync.
        revalidate();
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [serverAccessToken, supabase, revalidate]);

  //TRPC
  const url = useHref("/api/trpc");
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer: superjsonTransformer,
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV == "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: url,
        }),
      ],
    })
  );

  //LemonSqueezy
  const [lemonLoaded, setLemonLoaded] = useState(false);

  useEffect(() => {
    document.getElementById("lemon")?.addEventListener("load", () => {
      setLemonLoaded(true);
    });
    return () => {
      document.getElementById("lemon")?.removeEventListener("load", () => {
        setLemonLoaded(true);
      });
    };
  }, []);
  useEffect(() => {
    console.log(lemonLoaded);
    if (lemonLoaded) window.createLemonSqueezy();
  }, [lemonLoaded]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          id="lemon"
          src="https://app.lemonsqueezy.com/js/lemon.js"
          defer
        ></script>
        <Meta />
        <Links />
      </head>
      <body>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <Outlet context={{ supabase, session }} />
            <ScrollRestoration />
            <Scripts />
            <LiveReload />
            <Toaster />
          </QueryClientProvider>
        </trpc.Provider>
      </body>
    </html>
  );
}

export function useSupabase() {
  return useOutletContext<ContextType>();
}
