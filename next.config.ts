import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
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
      },

      // Bundle imported manuals and other PDF assets as URLs.
      {
        test: /\.pdf$/i,
        type: "asset/resource",
      },
    );

    return config;
  },
};

export default nextConfig;
