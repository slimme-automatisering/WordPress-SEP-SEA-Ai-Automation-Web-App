import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: "./src/dashboard",
  server: {
    port: 3001,
    host: true,
  },
  build: {
    outDir: "../../dist/dashboard",
    emptyOutDir: true,
    sourcemap: true,
  },
});
