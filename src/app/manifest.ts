import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LVG OS",
    short_name: "LVG OS",
    description: "Personal planning, goals, travel and growth.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0e1420",
    theme_color: "#0e1420",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
