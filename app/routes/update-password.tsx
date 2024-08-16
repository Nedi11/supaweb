import { LoaderFunctionArgs } from "@remix-run/node";
import { json, Link, redirect } from "@remix-run/react";
import path from "path";
import { Auth } from "@supabase/auth-ui-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useRootContext } from "~/root";
import { getServerSideSession } from "~/utils/auth.server";
import { Nav } from "~/components/nav-bar/Nav";
import { Footer } from "~/components/Footer";
import { useState } from "react";
import { da } from "@vidstack/react/dist/types/vidstack.js";
import Spinner from "~/components/Spinner";
export const meta = () => {
  const title = `Sign in or Register | CuratedIndustry`;
  return [
    {
      title: title,
    },
    {
      name: "description",
      content: "Hello. Sign in to CuratedIndustry or create an account.",
    },
    {
      property: "og:title",
      content: title,
    },
  ];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  // const { session } = await getServerSideSession(request);
  // const url = new URL(request.url);
  // const redirectPath = url.searchParams.get("redirectPath");
  // if (session) {
  //   if (redirectPath) return redirect(path.join("/", redirectPath));
  //   return redirect("/");
  // }
  return json({});
}
export default function Signin() {
  const { session, supabase } = useRootContext();
  const [newPassw, setNewPassw] = useState("");
  const [confirmNewPassw, setConfirmNewPassw] = useState("");
  const [error, setError] = useState<string | undefined>("");
  const [loading, setIsLoading] = useState(false);
  return (
    <>
      <Nav className="" />
      <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
        <div className="flex items-center flex-col justify-center py-12">
          <div className="md:border p-10 flex items-center flex-col rounded-xl md:shadow-2xl w-full max-w-[550px]  ">
            <span className=" text-xl font-semibold">Password Reset</span>
            <div className="flex flex-col w-full">
              <Label className="mt-3">New password</Label>
              <Input
                type="password"
                className="mt-1 w-full"
                placeholder="New password"
                value={newPassw}
                onChange={(e) => {
                  setNewPassw(e.target.value);
                }}
              ></Input>
              <Label className="mt-3">Confirm new password</Label>
              <Input
                type="password"
                className="mt-1"
                placeholder="Retype your new password"
                value={confirmNewPassw}
                onChange={(e) => {
                  setConfirmNewPassw(e.target.value);
                }}
              ></Input>
              <Button
                size={"lg"}
                className="mt-3"
                onClick={() => {
                  if (newPassw !== confirmNewPassw) {
                    setError("Passwords do not match");
                  } else {
                    setIsLoading(true);
                    supabase.auth
                      .updateUser({ password: newPassw })
                      .then((data) => {
                        if (data.error) {
                          setError(data.error?.message);
                        } else {
                          setError("Success! Password updated");
                        }
                      })
                      .finally(() => setIsLoading(false));
                  }
                }}
              >
                <Spinner
                  className={` ${
                    loading ? "visible" : "w-0"
                  } transition-all text-white`}
                />
                Reset password
              </Button>
            </div>
            {error && (
              <span className=" text-red-500 mt-3 w-full text-center">
                {error}
              </span>
            )}
            {/* <Auth
          
              supabaseClient={supabase}
              appearance={{
                extend: false,
                // needed instead of theme because auth ui broken on ssr
                className: {
                  anchor:
                    "text-sm underline mx-auto text-black/70 hover:text-black/50 transition-all",
                  button:
                    "bg-primary my-5 text-white rounded-lg p-2 hover:bg-green-500 transition-all",
                  container: "flex flex-col md:w-96 w-full",
                  divider: "",
                  input:
                    "flex h-9 w-full rounded-md border border-input transition-all bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                  label: "mt-3 flex flex-col text-sm",
                  loader: "",
                  message: "text-red-500 text-center block mt-3",
                },
              }}
              providers={[]}
              // socialLayout="horizontal"
            />*/}
          </div>
        </div>
        <div className="hidden bg-muted lg:block">
          <img
            src="/loginimage.jpg"
            alt="Image"
            width="1920"
            height="1080"
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      </div>
      <Footer />
    </>
  );
}
