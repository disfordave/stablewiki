import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["pg", "@prisma/adapter-pg"],
  // No remotePatterns: only the wiki's own /api/media images go through the
  // optimizer, otherwise anyone could use it to process arbitrary URLs.
};

export default nextConfig;
