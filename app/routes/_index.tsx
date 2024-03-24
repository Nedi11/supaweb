import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Search } from "lucide-react";
import { Nav } from "~/components/Nav";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useSupabase } from "~/root";
import { trpc } from "~/utils/api";
import { useIntersection } from "@mantine/hooks";
import { useEffect, useRef } from "react";
export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const { session, supabase } = useSupabase();
  const navBarRef = useRef<HTMLDivElement>(null);
  const { ref, entry } = useIntersection({
    root: navBarRef.current,
    threshold: 0.8,
  });

  useEffect(() => {
    console.log(entry);
  }, [entry]);
  return (
    <>
      <Nav ref={navBarRef} transparent={entry?.isIntersecting}></Nav>
      <main className="flex flex-col h-[4000px]">
        <div
          ref={ref}
          className="w-full md:h-[760px] h-[495px] flex flex-col justify-center bg-green-900 px-8"
        >
          <div className=" flex flex-col gap-8 md:w-[560px] w-full">
            <h1 className=" text-4xl text-white font-semibold ">
              Connect with reliable industrial suppliers,{" "}
              <span className=" italic font-black text-orange-300">
                instantly.
              </span>
            </h1>
            <div className="flex md:flex-row md:gap-0 flex-col gap-2">
              <Input
                className="bg-white h-12 md:rounded-r-none"
                placeholder="Search for any industrial solution..."
              ></Input>
              <Button className="h-12  px-6 md:rounded-l-none">
                <Search size={"15"} className="md:visible hidden" />
                <span className="  ">Search</span>
              </Button>
            </div>
            <div className="text-white flex gap-4 items-center text-c">
              <p>Pupular: </p>
              <Badge className="h-6 bg-transparent border-secondary hover:cursor-pointer">
                Flow Meter
              </Badge>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
