import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // add unsplash source to next.config.js
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },

    ],

  },
};

export default nextConfig;
