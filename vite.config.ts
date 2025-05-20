
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
      'sonner',
      'lucide-react'
    ],
    exclude: [],
    esbuildOptions: {
      target: 'es2020',
    }
  },
  build: {
    sourcemap: true,
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        // Disable features that might cause issues
        keep_infinity: true,
        drop_console: false
      }
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Create more efficient chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            if (id.includes('lucide') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'utils-vendor';
            }
            // Put remaining dependencies in a shared vendor chunk
            return 'vendor';
          }
        }
      }
    }
  },
  // Improve error handling for undefined 'this' in ESM
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
}));
