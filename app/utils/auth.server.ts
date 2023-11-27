import { env } from "$/env.mjs";
import { createServerClient, serialize } from "@supabase/ssr";
import { parse } from "@supabase/ssr";
import { json } from "@remix-run/node";
import { prisma } from "./db.server";

export async function getServerSideSession(request: Request) {
  const cookies = parse(request.headers.get("Cookie") ?? "");
  const headers = new Headers();

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
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return { session, headers };
}

export async function requireAuth(request: Request) {
  const { session } = await getServerSideSession(request);
  if (!session?.user.id) {
    throw json(
      { error: "UNAUTHORIZED", message: "Not logged in." },
      { status: 403 }
    );
  }
}

export async function requireAdmin(request: Request) {
  const { session } = await getServerSideSession(request);
  if (session?.user.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (user) {
      return;
    }
  }
  throw json(
    { error: "UNAUTHORIZED", message: "Missing authorization." },
    { status: 403 }
  );
}
