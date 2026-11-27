import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Files the server reads at runtime (catalog snapshot, articles, the gated PDF, keyword list).
  // Listed so hosting platforms like Vercel bundle them with every server function.
  outputFileTracingIncludes: {
    "/*": ["./src/data/**/*.json", "./content/**/*"],
    // pdfkit reads its built-in font metrics from disk when it builds the comparison PDF
    "/api/compare-pdf/*": ["./node_modules/pdfkit/js/data/**/*"],
  },
  // Loaded from node_modules as-is (not bundled), so pdfkit can find those font files
  serverExternalPackages: ["pdfkit"],
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
