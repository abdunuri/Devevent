import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TECHVENT",
    short_name: "TECHVENT",
    description: "The Hub for Tech Events in Addis",
    start_url: "/",
    display: "standalone",
    background_color: "hsl(0, 0%, 0%)",
    theme_color: "#030708",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: "/icons/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}