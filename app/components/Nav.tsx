import React from "react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
export const Nav = React.forwardRef<HTMLDivElement, { transparent?: boolean }>(
  ({ transparent }, ref) => {
    return (
      <div
        className={`flex w-full fixed top-0 left-0 items-center px-5 justify-center h-20 transition-all z-10  ${
          transparent == true ? "" : "bg-white"
        }`}
      >
        <div className="max-w-container flex w-full ">
          <Sheet>
            <SheetTrigger asChild className=" md:hidden">
              <HamburgerMenuIcon
                className={`h-8 w-8 ${
                  transparent ? "text-white" : "text-black"
                } mr-5 my-auto`}
              />
            </SheetTrigger>
            <SheetContent side={"left"}>
              <SheetHeader>
                <SheetTitle>CuratedIndustry</SheetTitle>
                <SheetDescription></SheetDescription>
              </SheetHeader>
              MEnu
              <SheetFooter>
                {/* <SheetClose asChild>
                  <Button type="submit">Save changes</Button>
                </SheetClose> */}
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {transparent ? (
            <img src="/WhiteLogoV2.svg" className="h-10 object-contain "></img>
          ) : (
            <img src="/DarkLogoV2.svg" className="h-10 object-contain "></img>
          )}

          <div className={`ml-auto md:flex gap-7 hidden `}>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"link"}
                  className={`  hover:no-underline  p-0 ${
                    transparent
                      ? "text-white hover:"
                      : "text-foreground hover:text-primary"
                  }`}
                >
                  Categories
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80"></PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"link"}
                  className={`  hover:no-underline transition-all p-0 ${
                    transparent
                      ? "text-white hover:"
                      : "text-foreground hover:text-primary"
                  }`}
                >
                  Explore
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80"></PopoverContent>
            </Popover>
            <Button
              variant={"outline"}
              className={`border-primary bg-transparent  hover:bg-primary hover:text-white ml-auto ${
                transparent
                  ? " text-white border-white hover:border-primary"
                  : " text-primary"
              } `}
            >
              Sign In
            </Button>
          </div>
          <Button
            variant={"outline"}
            className={`border-primary bg-transparent md:hidden hover:bg-primary hover:text-white ml-auto ${
              transparent
                ? " text-white border-white hover:border-primary"
                : " text-primary"
            } `}
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }
);
