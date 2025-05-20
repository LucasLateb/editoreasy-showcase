
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
      'lucide-react',
      // Added more common dependencies for pre-bundling
      'clsx',
      'tailwind-merge',
      'date-fns',
      '@radix-ui/react-slot',
      '@radix-ui/react-dialog',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-popover',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-toast',
      // Add other Radix components if they become problematic or heavily used
    ],
    exclude: [], // Generally keep this empty
    esbuildOptions: {
      target: 'es2020', // Ensures modern JS syntax compatibility
    }
  },
  build: {
    sourcemap: true, // Enable sourcemaps for easier debugging
    target: 'es2020', // Target modern browsers
    minify: 'terser', // Using Terser for minification
    terserOptions: {
      compress: {
        keep_infinity: true,
        drop_console: false, // Keep console logs for debugging in previews
      }
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Refined chunking strategy
          if (id.includes('node_modules')) {
            const modulePath = id.toString();
            if (modulePath.includes('/react/') || modulePath.includes('/react-dom/') || modulePath.includes('/react-router-dom/')) {
              return 'react-vendors'; // Group core React libraries
            }
            if (modulePath.includes('/@radix-ui/')) {
              return 'radix-vendors'; // Group all Radix UI libraries
            }
            if (modulePath.includes('/@tanstack/react-query/')) {
              return 'tanstack-vendors'; // Group Tanstack Query
            }
            if (modulePath.includes('/lucide-react/')) {
              return 'lucide-vendors'; // Group Lucide icons
            }
            if (modulePath.includes('clsx') || modulePath.includes('tailwind-merge') || modulePath.includes('sonner') || modulePath.includes('date-fns')) {
              return 'utils-vendors'; // Group common utility libraries
            }
            // A general vendor chunk for other node_modules dependencies
            return 'other-vendors';
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

