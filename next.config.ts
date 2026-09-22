import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "bath-culpable-paper.ngrok-free.dev",
  ],

  webpack(config) {
    // pdfjs-dist (via @react-pdf-viewer, used by the Blockly manual viewer) has a
    // Node-only code path that requires the native `canvas` package. It never runs
    // in the browser, so resolve it to an empty module instead of failing the build.
    config.resolve.alias = { ...config.resolve.alias, canvas: false };

    // Find the default asset rule
    const fileLoaderRule = config.module.rules.find(
      (rule: any) => rule.test?.test?.(".svg")
    );

    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i;
    }

    config.module.rules.push(
      // *.svg?url -> URL
      {
        test: /\.svg$/i,
        resourceQuery: /url/,
        type: "asset/resource",
      },

      // *.svg -> React Component
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: [/url/] },
        use: ["@svgr/webpack"],
      }
    );

    return config;
  },
};

export default nextConfig;
