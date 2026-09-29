import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

const nextConfig: NextConfig = {
  // "About me" became Settings.
  async redirects() {
    return [{ source: "/about", destination: "/settings", permanent: true }];
  },
};

export default withSerwist(nextConfig);
