// vite.config.js
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const XANO_HOST = "https://x8ki-letl-twmt.n7.xano.io";

// ⚙️ Grupo del LOGIN (auth)
// Este es el grupo donde están los endpoints /auth/login y /auth/me
const AUTH_GROUP_ID = "MJq6ok-f";

// ⚙️ Grupo del catálogo, carrito, etc.
// Este es el grupo que devuelve los 6 productos (ya funcionando)
const CORE_GROUP_ID = "Ekf2eplz";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      axios: path.resolve(__dirname, "src/lib/miniAxios.js"),
    },
  },
  server: {
    open: "/",
    proxy: {
      // 🔐 Autenticación
      "/xano-auth": {
        target: `${XANO_HOST}/api:${AUTH_GROUP_ID}`,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/xano-auth/, ""),
        configure: (proxy) => {
          proxy.on("error", (err) => console.error("❌ Auth proxy error:", err));
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("🔐 Auth:", req.method, req.url, "→", proxyReq.path);
          });
          proxy.on("proxyRes", (proxyRes, req) => {
            console.log("✅ Auth response:", proxyRes.statusCode, req.method, req.url);
          });
        },
      },

      // 🛒 Core (productos, carrito)
      "/xano-core": {
        target: `${XANO_HOST}/api:${CORE_GROUP_ID}`,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/xano-core/, ""),
        configure: (proxy) => {
          proxy.on("error", (err) => console.error("❌ Core proxy error:", err));
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("🛒 Core:", req.method, req.url, "→", proxyReq.path);
          });
          proxy.on("proxyRes", (proxyRes, req) => {
            console.log("✅ Core response:", proxyRes.statusCode, req.method, req.url);
          });
        },
      },
    },
  },
});
