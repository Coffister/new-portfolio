import { defineConfig, type Connect } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Honour a port supplied via the environment (e.g. the preview harness) and
// fall back to Vite's usual default for a plain `npm run dev`.
const port = Number(process.env.PORT) || 5173;

// /brand/<slug> is served by brand.html; vercel.json does the same in production.
const brandPage: Connect.NextHandleFunction = (req, _res, next) => {
  if (/^\/brand\/[a-z0-9-]+\/?(\?|$)/.test(req.url ?? "")) req.url = "/brand.html";
  next();
};

export default defineConfig({
  plugins: [
    react(),
    {
      name: "brand-pages",
      configureServer: (server) => void server.middlewares.use(brandPage),
      configurePreviewServer: (server) => void server.middlewares.use(brandPage),
    },
  ],
  server: {
    port,
  },
  build: {
    rolldownOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        brand: path.resolve(__dirname, "brand.html"),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
