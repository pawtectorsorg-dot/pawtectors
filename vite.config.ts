import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 10001,
    proxy: (() => {
      const backendPort = process.env.BACKEND_PORT || process.env.PORT || 3003;
      const target = `http://localhost:${backendPort}`;
      return {
        '/api': { target, changeOrigin: true },
        '/auth': { target, changeOrigin: true },
      };
    })(),
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
