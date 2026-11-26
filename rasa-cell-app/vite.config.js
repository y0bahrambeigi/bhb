import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    target: "es2020",
    outDir: "dist",
    emptyOutDir: true,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 700
  },
  server: {
    port: 4173,
    strictPort: true
  },
  preview: {
    port: 4173,
    strictPort: true
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"]
  }
});
