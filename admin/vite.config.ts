import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const adminNode = path.resolve(__dirname, "node_modules");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../shared"),
      "lucide-react": path.resolve(adminNode, "lucide-react"),
      "react": path.resolve(adminNode, "react"),
      "react-dom": path.resolve(adminNode, "react-dom"),
    },
  },
  server: {
    port: 3002,
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
