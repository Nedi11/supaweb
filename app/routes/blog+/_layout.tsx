import { Outlet } from "@remix-run/react";
import { useSupabase } from "~/root";

export default function Auth() {
  const rootContext = useSupabase();
  return (
    <>
      <div className="mt-4">
        <Outlet context={{ ...rootContext }} />
      </div>
    </>
  );
}
