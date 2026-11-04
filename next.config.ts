import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.210", "192.168.18.1"],
  async headers() {
    return [
      "/python/runtime/:path*",
      "/python/harness.py",
      "/python/worker.js",
    ].map((source) => ({
      source,
      headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
    }));
  },
  outputFileTracingIncludes: {
    "/api/check": [
      "./node_modules/typescript/lib/*.d.ts",
      "./node_modules/@types/react/**/*",
      "./node_modules/@types/react-dom/**/*",
      "./node_modules/csstype/**/*",
    ],
  },
};

export default nextConfig;
