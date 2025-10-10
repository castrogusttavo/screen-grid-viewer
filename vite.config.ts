import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    port: 8080,
    host: '0.0.0.0',  // CRÍTICO: escuta em todos os IPs
    strictPort: true,
    hmr: {
      host: '172.20.29.194',  // IP da VPN para Hot Module Replacement
      port: 8080
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
