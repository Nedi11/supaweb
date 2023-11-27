import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { useSupabase } from "~/root";
import { trpc } from "~/utils/api";
export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const { session, supabase } = useSupabase();
  const unportectedRoute = trpc.example.hello.useQuery({
    text: "TRPC (fetched from client)",
  });
  const protectedRoute = trpc.example.getSecretMessage.useQuery();
  return (
    <div className="bg-gradient-to-r from-gray-100 to-gray-300 min-h-screen flex flex-col items-center justify-center">
      <h1 className=" font-black text-5xl mb-6">
        SUPAWEB <span className=" bg-black rounded-full ">🚀</span>
      </h1>
      {session?.user ? (
        <div className="flex flex-col">
          <div className="">
            <strong>Signed in with:</strong> {session.user.email}
          </div>
          <button
            className=" underline"
            onClick={() => {
              supabase.auth.signOut();
            }}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="flex flex-col">
          <Link className="underline" to={"/signin"}>
            Sign In
          </Link>
        </div>
      )}
      <span> {unportectedRoute.data?.greeting}</span>
      <span> {protectedRoute.data}</span>
    </div>
  );
}
