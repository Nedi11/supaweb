import { redirect } from "@remix-run/node";
import { createServerClient, serialize } from "@supabase/ssr";

import type { Database } from "~/types/database.types";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { env } from "$/env.mjs";
import { parse } from "@supabase/ssr";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const cookies = parse(request.headers.get("Cookie") ?? "");
  const headers = new Headers();
  if (code) {
    const supabase = createServerClient(
      env.SUPABASE_URL,
      env.SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(key) {
            return cookies[key];
          },
          set(key, value, options) {
            headers.append("Set-Cookie", serialize(key, value, options));
          },
          remove(key, options) {
            headers.append("Set-Cookie", serialize(key, "", options));
          },
        },
      }
    );
    await supabase.auth.exchangeCodeForSession(code);
  }

  return redirect("/", {
    headers,
  });
};
