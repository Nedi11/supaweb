import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Search, Video } from "lucide-react";
import { Nav } from "~/components/Nav";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useSupabase } from "~/root";
import { trpc } from "~/utils/api";
import { useIntersection } from "@mantine/hooks";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { MediaPlayer, MediaProvider } from "@vidstack/react";
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
    threshold: 1,
  });

  return (
    <>
      <Nav
        ref={navBarRef}
        transparent={entry == undefined ? true : entry.isIntersecting}
      ></Nav>
      <main className="flex flex-col h-[4000px]">
        <div className="bg-green-900 w-full flex justify-center px-4 ">
          <div
            ref={ref}
            className="md:h-[760px] gap-4 h-[495px] flex flex-row  md:items-center items-end pb-10 md:pb-0 w-full max-w-container md:px-0"
          >
            <div className=" flex flex-col gap-8 md:w-[650px] w-full">
              <h1 className=" text-3xl md:text-5xl text-white font-semibold ">
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
                  <Search size={"15"} className="md:block hidden" />
                  <span className="visible md:hidden ">Search</span>
                </Button>
              </div>
              <div className="text-white flex gap-4 items-center">
                <p>Pupular: </p>
                <Badge className="h-7 text-md bg-transparent border-secondary hover:cursor-pointer hover:bg-white hover:text-black">
                  Flow Meter
                </Badge>
                <Badge className="h-7 text-md bg-transparent border-secondary hover:cursor-pointer hover:bg-white hover:text-black">
                  Flow Meter
                </Badge>
                <Badge className="h-7 text-md bg-transparent border-secondary hover:cursor-pointer hover:bg-white hover:text-black">
                  Flow Meter
                </Badge>
                <Badge className="h-7 text-md bg-transparent border-secondary hover:cursor-pointer hover:bg-white hover:text-black">
                  Flow Meter
                </Badge>
              </div>
            </div>
            <div></div>
            <div
              className=" h-[400px] aspect-video rounded-xl overflow-hidden ml-auto hidden md:block "
              style={{ padding: "0 0 0 0", position: "relative" }}
            >
              <iframe
                src="https://player.vimeo.com/video/926894737?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                }}
                title="CuratedIndustry"
              ></iframe>
            </div>

            {/* <img
              src="/heroImage.jpg"
              className=" h-[600px] ml-auto rounded-xl md:block hidden"
            />*/}
          </div>
        </div>
      </main>
    </>
  );
}
