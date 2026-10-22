import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.210", "192.168.18.1"],
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
