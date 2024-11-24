import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  plugins: [
    // without this, remixCloudflareDevProxy trying to load workerd even for production (it's not needed for production)
    mode === "production" ? undefined : remixCloudflareDevProxy(),
    remix({
      future: {
        v3_singleFetch: true,
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
  ].filter(Boolean),
}));
