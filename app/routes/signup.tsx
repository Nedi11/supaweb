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
import { set } from "lodash";
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
  const { session } = await getServerSideSession(request);
  const url = new URL(request.url);
  const redirectPath = url.searchParams.get("redirectPath");
  if (session) {
    if (redirectPath) return redirect(path.join("/", redirectPath));
    return redirect("/");
  }
  return json({});
}
export default function Signin() {
  const { session, supabase } = useRootContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>("");
  const [loading, setIsLoading] = useState(false);
  return (
    <>
      <Nav className="" />
      <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
        <div className="flex items-center flex-col justify-center py-12">
          <div className="md:border p-10 flex items-center flex-col rounded-xl md:shadow-2xl w-full max-w-[550px]  ">
            <span className=" text-xl font-semibold">Sign up</span>
            <div className="flex flex-col w-full">
              <Label className="mt-3">Email</Label>
              <Input
                className="mt-1 w-full"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              ></Input>
              <Label className="mt-3">Password</Label>
              <Input
                type="password"
                className="mt-1"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              ></Input>
              <Button
                size={"lg"}
                className="mt-3 gap-3"
                onClick={() => {
                  setIsLoading(true);
                  supabase.auth
                    .signUp({
                      email: email,
                      password: password,
                    })
                    .then((res) => {
                      if (res.error) {
                        setError(res.error?.message);
                      } else {
                        setError("Check email for verification link");
                      }
                    })
                    .finally(() => setIsLoading(false));
                }}
              >
                <Spinner
                  className={` ${
                    loading ? "visible" : "w-0"
                  } transition-all text-white`}
                />
                Sign up
              </Button>
              {error && (
                <span className=" text-red-500 mt-3 w-full text-center">
                  {error}
                </span>
              )}

              <Link
                className=" mt-3 inline-flex items-center justify-center h-fit whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 underline-offset-4 hover:underline  px-4  text-black/50"
                to="/signin"
              >
                <Button
                  variant={"link"}
                  className="text-black/50 py-0 my-0 h-fit"
                >
                  Have an account? Sign in
                </Button>
              </Link>
            </div>

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
