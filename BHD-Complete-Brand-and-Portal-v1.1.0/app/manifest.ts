import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BHD — Build Higher Dreams",
    short_name: "BHD",
    description: "البوابة الرسمية لمنظومة Bin Hamood Development الرقمية.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfaf7",
    theme_color: "#092d24",
    lang: "ar",
    dir: "rtl",
    icons: [
      {
        src: "/brand/bhd-mark-2048.png",
        sizes: "2048x2048",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
