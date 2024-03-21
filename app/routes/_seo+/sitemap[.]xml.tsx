import { generateSitemap } from "@nasa-gcn/remix-seo";
import { findConfig } from "@remix-run/dev/dist/config";
import { RemixPluginContext } from "@remix-run/dev/dist/vite/plugin";
import { type ServerBuild, type LoaderFunctionArgs } from "@remix-run/node";
import path from "path";
import { ResolvedConfig } from "vite";
import { getDomainUrl } from "~/utils/misc";

import { CaseSensitive } from "lucide-react";
import { getPostsPaths } from "~/utils/blog.server";
async function resolveViteConfig({
  configFile,
  mode,
  root,
}: {
  configFile?: string;
  mode?: string;
  root: string;
}) {
  let vite = await import("vite");

  let viteConfig = await vite.resolveConfig(
    { mode, configFile, root },
    "build", // command
    "production", // default mode
    "production" // default NODE_ENV
  );

  if (typeof viteConfig.build.manifest === "string") {
    throw new Error("Custom Vite manifest paths are not supported");
  }

  return viteConfig;
}

async function extractRemixPluginContext(viteConfig: ResolvedConfig) {
  return viteConfig["__remixPluginContext" as keyof typeof viteConfig] as
    | RemixPluginContext
    | undefined;
}

async function loadVitePluginContext({
  configFile,
  root,
}: {
  configFile?: string;
  root?: string;
}) {
  if (!root) {
    root = process.env.REMIX_ROOT || process.cwd();
  }

  configFile =
    configFile ??
    findConfig(root, "vite.config", [
      ".ts",
      ".cts",
      ".mts",
      ".js",
      ".cjs",
      ".mjs",
    ]);

  // V3 TODO: Vite config should not be optional
  if (!configFile) {
    return;
  }

  let viteConfig = await resolveViteConfig({ configFile, root });
  return await extractRemixPluginContext(viteConfig);
}

const ignorePaths = [
  "auth",
  "api",
  "dashboard",
  "admin",
  "billing",
  "webhooks",
];

export async function loader({ request, context }: LoaderFunctionArgs) {
  const ctx = await loadVitePluginContext({});
  const routes = ctx?.remixConfig.routes as any;
  let xml = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`;
  xml += `<url><loc>https://www.superbindex.com</loc><priority>1.0</priority><changefreq>daily</changefreq></url>`;
  if (routes) {
    const arr = Object.entries(routes).forEach(([key, value]) => {
      const val = value as {
        path?: string;
        index: any;
        caseSensitive: any;
        id: any;
        parentId: any;
        file: any;
      };
      if (
        val.path &&
        !val.path.startsWith(":") &&
        !val.path.endsWith("+") &&
        !ignorePaths.includes(val.path.split("/")[0])
      ) {
        xml += `<url><loc>https://www.superbindex.com/${val.path}</loc><priority>0.9</priority><changefreq>weekly</changefreq></url>`;
      }
    });

    const posts = getPostsPaths();

    posts.forEach((postPath) => {
      xml += `<url><loc>https://www.superbindex.com/blog/${postPath.replace(
        /\.md$/,
        ""
      )}</loc><priority>0.9</priority><changefreq>weekly</changefreq></url>`;
    });
    xml += `</urlset>`;

    return new Response(xml, {
      headers: { "Content-Type": "application/xml" },
    });
  }
}
