import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: "./src/frontend",
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: "../../dist/frontend",
    emptyOutDir: true,
    sourcemap: true,
  },
});
