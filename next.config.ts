import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'export', // Enables static export
  images: { unoptimized: true },
};

export default nextConfig;
