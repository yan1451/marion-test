import { defineConfig } from "vite";

// https://vite.dev/config/

export default defineConfig({
  server: {
    port: 5173,
    open: true,
  },
  optimizeDeps: {
    include: ["@pixi/layout", "@pixi/layout/components", "eventemitter3"],
  },
});
