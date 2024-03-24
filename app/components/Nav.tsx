import React from "react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
export const Nav = React.forwardRef<HTMLDivElement, { transparent?: boolean }>(
  ({ transparent }, ref) => {
    return (
      <div
        className={`flex w-full fixed top-0 left-0 items-center px-5 h-20 transition-all ${
          transparent ? "" : "bg-white"
        }`}
      >
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
                className={`  hover:no-underline  p-0 ${
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
          className={`border-primary text-white visible md:hidden hover:bg-primary bg-transparent border-white hover:border-primary hover:text-white ml-auto `}
        >
          Sign In
        </Button>
      </div>
    );
  }
);
