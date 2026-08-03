import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SalesFlow - Fibre Sales CRM",
    short_name: "SalesFlow",
    description: "Secure fibre sales, workload, opportunities, reports, and offer intelligence.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7fbf8",
    theme_color: "#008a3b",
    orientation: "portrait",
    icons: [{ src: "/salesflow-icon.png", sizes: "1024x1024", type: "image/png", purpose: "maskable" }],
  };
}
