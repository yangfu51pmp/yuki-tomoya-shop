import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  partialPrefetching: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      {
        source: "/og-share.jpg",
        destination: "/api/line?og_img=1",
      },
    ];
  },
};

export default nextConfig;
