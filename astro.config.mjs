import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

const site = process.env.SITE_URL || "https://tutorfinder-bd.vercel.app";

export default defineConfig({
  site,
  output: "server",
  adapter: vercel(),
  integrations: [mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
});