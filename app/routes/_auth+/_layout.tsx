import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, Outlet } from "@remix-run/react";

import { getServerSideSession } from "~/utils/auth.server";
import { useSupabase } from "~/root";
import { superjson } from "~/utils/superjson";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { session } = await getServerSideSession(request);
  if (session) {
    return superjson({});
  }
  const url = request.url;
  const splited = url.split("/");
  const path = splited.slice(3, splited.length).join("/");
  return redirect(`/signin?redirectPath=${path}`);
}
export default function Auth({ children }: { children: React.ReactNode }) {
  const rootContext = useSupabase();
  return (
    <>
      <div className="mt-4">
        <Outlet context={{ ...rootContext }} />
      </div>
    </>
  );
}
