import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ["10.0.0.0/8", "192.168.0.0/16", "172.16.0.0/12"],
};

export default nextConfig;
