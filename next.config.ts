import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/emirates-tracker",
  assetPrefix: "/emirates-tracker/",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;