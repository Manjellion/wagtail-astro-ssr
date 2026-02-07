// @ts-check
import { defineConfig } from "astro/config";

import node from "@astrojs/node";

// https://astro.build/config

export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  // set this if you know your public domain (helps canonicals)
  site: process.env.PUBLIC_SITE_URL || "http://localhost:3000",
});
