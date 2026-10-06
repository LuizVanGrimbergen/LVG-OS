import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LVG OS",
    short_name: "LVG OS",
    description: "Personal planning, goals and growth.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0e1420",
    theme_color: "#0e1420",
    // Long-press the app icon for these.
    shortcuts: [
      { name: "New task", short_name: "Task", url: "/tasks?new=1", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Quick note", short_name: "Note", url: "/notes?new=1", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
    // Share text or a link from another app straight into Notes (Android).
    share_target: {
      action: "/notes",
      method: "GET",
      params: { title: "title", text: "text", url: "url" },
    },
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
