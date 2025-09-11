import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Explicitly set Turbopack workspace root to avoid wrong lockfile selection
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
};

export default nextConfig;
