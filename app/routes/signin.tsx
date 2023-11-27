import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, useOutletContext } from "@remix-run/react";
import { Auth } from "@supabase/auth-ui-react";

import { useSupabase } from "~/root";
import { getServerSideSession } from "~/utils/auth.server";
import path from "path";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { session } = await getServerSideSession(request);
  const url = new URL(request.url);
  const redirectPath = url.searchParams.get("redirectPath");
  if (session) {
    if (redirectPath) return redirect(path.join("/", redirectPath));
    return redirect("/");
  }
  return json({});
}

export default function SignIn() {
  const { session, supabase } = useSupabase();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-9">
      <Link to={"/"} className="font-bold text-4xl">
        SUPAWEB <span className=" bg-black rounded-full ">🚀</span>
      </Link>
      <div className=" max-w-md w-full mt-6 border shadow p-6 rounded-lg ">
        <Auth
          providers={[]}
          appearance={{
            extend: false,
            //needed instead of theme because auth ui broken on ssr
            className: {
              anchor:
                "text-sm underline mx-auto text-black/70 hover:text-black/50 transition-all",
              button:
                "bg-zinc-900 my-5 text-white rounded-lg p-2 hover:bg-zinc-700 transition-all",
              container: "flex flex-col",
              divider: "",
              input:
                "flex h-9 w-full rounded-md border border-input transition-all bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              label: " mt-3 flex flex-col text-sm",
              loader: "",
              message: "text-red-500 text-center block mt-3",
            },
          }}
          magicLink={true}
          supabaseClient={supabase}
        />
      </div>
    </div>
  );
}
