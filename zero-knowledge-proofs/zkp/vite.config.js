import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis",
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  optimizeDeps: {
    include: ["snarkjs", "circomlib", "ffjavascript"],
  },
  server: {
    port: 3001,
    open: true,
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          crypto: ["snarkjs", "circomlib", "ffjavascript"],
        },
      },
    },
    target: "esnext",
  },
  worker: {
    format: "es",
  },
});
