import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    host: true,
  },
  build: {
    sourcemap: mode === "development",
    outDir: "../dist/tableviewer",  // Build into dist/tableviewer
    emptyOutDir: true
  },
  base: "./",
}));