// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // локальный Strapi
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/**",
      },

      // если у тебя Strapi на домене (lioneto-cms.ru)
      {
        protocol: "https",
        hostname: "lioneto-cms.ru",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.lioneto-cms.ru",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
