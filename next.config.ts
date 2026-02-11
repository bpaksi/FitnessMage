import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  env: {
    BUILD_ID: process.env.NODE_ENV === 'production' ? Date.now().toString() : 'dev',
  },
  allowedDevOrigins: ["10.0.0.0/8", "192.168.0.0/16", "172.16.0.0/12"],
  headers: async () => [
    {
      // HTML pages: always revalidate so the browser fetches latest JS bundles
      source: "/((?!_next/static|_next/image|icons|icon-|favicon).*)",
      headers: [
        { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
      ],
    },
  ],
};

export default nextConfig;
