import express from "express";
import compression from "compression";
import morgan from "morgan";
import {
  createRequestHandler,
  GetLoadContextFunction,
} from "@remix-run/express";
import { installGlobals } from "@remix-run/node";
import { prisma } from "./db";
async function main() {
  // patch in Remix runtime globals
  installGlobals();

  /**
   * @typedef {import('@remix-run/node').ServerBuild} ServerBuild
   */
  // const BUILD_PATH = path.join(process.cwd(), "build/server/index.js");
  const BUILD_PATH = "../build/server/index.js";
  const vite =
    process.env.NODE_ENV === "production"
      ? undefined
      : await import("vite").then((vite) =>
          vite.createServer({
            server: { middlewareMode: true },
          })
        );

  const app = express();

  app.use(compression());

  // http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
  app.disable("x-powered-by");

  // Remix fingerprints its assets so we can cache forever.
  if (vite) {
    app.use(vite.middlewares);
  } else {
    app.use(
      "/assets",
      express.static("build/client/assets", {
        immutable: true,
        maxAge: "1y",
      })
    );
  }

  // Everything else (like favicon.ico) is cached for an hour. You may want to be
  // more aggressive with this caching.
  app.use(express.static("build/client", { maxAge: "1h" }));

  app.use(morgan("tiny"));

  const getLoadContext: GetLoadContextFunction = () => {
    return { prisma };
  };

  // Check if the server is running in development mode and use the devBuild to reflect realtime changes in the codebase.
  app.all(
    "*",

    createRequestHandler({
      build: vite
        ? () => vite.ssrLoadModule("virtual:remix/server-build")
        : await import(BUILD_PATH),
      getLoadContext,
    })
  );

  const port = process.env.PORT || 3000;

  app.listen(port, async () => {
    console.log(`Express server listening on port ${port}`);
  });
}
main();
