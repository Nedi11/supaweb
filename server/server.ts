import path from "node:path";
import express from "express";
import compression from "compression";
import morgan from "morgan";
import { createRequestHandler } from "@remix-run/express";
import { installGlobals } from "@remix-run/node";
import sourceMapSupport from "source-map-support";
import {
  unstable_createViteServer, // provides middleware for handling asset requests
  unstable_loadViteServerBuild, // handles initial render requests
} from "@remix-run/dev";

// patch in Remix runtime globals
installGlobals();
sourceMapSupport.install();

/**
 * @typedef {import('@remix-run/node').ServerBuild} ServerBuild
 */
const BUILD_PATH = path.join(process.cwd(), "build/index.js");

const vite =
  process.env.NODE_ENV === "production"
    ? undefined
    : await unstable_createViteServer();

/**
 * Initial build
 * @type {ServerBuild}
 */

const app = express();

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// Remix fingerprints its assets so we can cache forever.
if (vite) {
  app.use(vite.middlewares);
} else {
  app.use(
    "/build",
    express.static("public/build", { immutable: true, maxAge: "1y" })
  );
}

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("public", { maxAge: "1h" }));

app.use(morgan("tiny"));

// const getLoadContext: GetLoadContextFunction = () => {
//   return { prisma };
// };

// Check if the server is running in development mode and use the devBuild to reflect realtime changes in the codebase.
app.all(
  "*",

  createRequestHandler({
    build: vite
      ? () => unstable_loadViteServerBuild(vite)
      : await import(BUILD_PATH),
  })
);

const port = process.env.PORT || 3000;

app.listen(port, async () => {
  console.log(`Express server listening on port ${port}`);
});
