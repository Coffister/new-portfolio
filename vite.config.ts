import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Honour a port supplied via the environment (e.g. the preview harness) and
// fall back to Vite's usual default for a plain `npm run dev`.
const port = Number(process.env.PORT) || 5173;

export default defineConfig({
  plugins: [react()],
  server: {
    port,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
