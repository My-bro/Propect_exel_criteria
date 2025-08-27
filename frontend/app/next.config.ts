import type { NextConfig } from "next";

const nextConfig = {
  // ...other config
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://0.0.0.0:3000"
  ]
}
export default nextConfig;
