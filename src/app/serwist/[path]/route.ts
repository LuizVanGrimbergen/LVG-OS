import { createSerwistRoute } from "@serwist/turbopack";

// Serves the bundled service worker at /serwist/sw.js
export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    swSrc: "src/app/sw.ts",
    useNativeEsbuild: true,
  });
