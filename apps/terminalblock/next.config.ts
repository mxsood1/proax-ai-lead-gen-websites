import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Files the server reads at runtime (catalog snapshot, articles, the gated PDF, keyword list).
  // Listed so hosting platforms like Vercel bundle them with every server function.
  outputFileTracingIncludes: {
    "/*": ["./src/data/**/*.json", "./content/**/*"],
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
