import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { flatRoutes } from "remix-flat-routes";

export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ["**/*"],
      serverModuleFormat: "esm",
      routes: async (defineRoutes) => {
        return flatRoutes("routes", defineRoutes);
      },
    }),
    tsconfigPaths(),
  ],
  ssr: { noExternal: ["typesense-instantsearch-adapter"] },
  server: { hmr: true },
  // optimizeDeps: { disabled: false },
  // build: { rollupOptions: { external: ["@rollup"] } },
});
