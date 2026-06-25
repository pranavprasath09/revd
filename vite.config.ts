import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: { port: 1572 },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Split heavy third-party libs out of the per-page chunks so the
        // initial load is small and vendor code caches across deploys.
        manualChunks(id: string) {
          if (id.includes("node_modules/react") || id.includes("node_modules/scheduler"))
            return "react-vendor";
          if (id.includes("node_modules/@supabase")) return "supabase";
        },
      },
    },
  },
});
