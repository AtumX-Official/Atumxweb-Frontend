import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    // Exclude SVGs from the default file loader
    const fileLoaderRule = config.module.rules.find(
      (rule: any) => rule.test?.test?.(".svg")
    );

    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i;
    }

    // Use SVGR for SVG imports
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

export default nextConfig;