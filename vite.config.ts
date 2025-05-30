

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      runtimeErrorOverlay(),
      ...(mode !== "production" &&
      process.env.REPL_ID !== undefined
        ? [
            await import("@replit/vite-plugin-cartographer").then((m) =>
              m.cartographer(),
            ),
          ]
        : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    root: path.resolve(import.meta.dirname, "client"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      host: true, // Allow the server to be accessed from any host
      port: 54903, // Use one of the required ports
      strictPort: true, // Ensure the specified port is used
      proxy: {
        // Proxy API requests to the backend server
        '/api': 'http://localhost:54903',
      },
      cors: true, // Enable CORS for all origins
    },
  };
});

