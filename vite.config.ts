
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'i18next',
      'react-i18next',
      'i18next-http-backend',
      'i18next-browser-languagedetector',
      // Radix UI components are generally ESM first, but if issues persist,
      // specific ones like '@radix-ui/react-dropdown-menu' could be added.
      // For now, let's stick to the major ones.
    ],
  },
  // The build section remains commented out as it's primarily for production optimization.
  // build: {
  //   rollupOptions: {
  //     output: {
  //       manualChunks(id) {
  //         if (id.includes('node_modules')) {
  //           // Group vendor modules into a single chunk
  //           return 'vendor';
  //         }
  //       },
  //     },
  //   },
  // },
}));

