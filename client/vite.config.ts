import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src"), "@shared": path.resolve(__dirname, "../shared") },
  },
  server: {
    port: 3003,
    headers: {
      "Cache-Control": "no-store",
    },
    watch: {
      usePolling: true,
      interval: 100,
    },
    proxy: {
      "/api": { target: "http://localhost:4000", changeOrigin: true },
      "/uploads": { target: "http://localhost:4000", changeOrigin: true },
    },
  },
});
