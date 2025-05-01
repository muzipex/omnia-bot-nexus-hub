import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { compression } from 'vite-plugin-compression2';

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br|gz)$/i],
      deleteOriginalAssets: false,
    }),
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br|gz)$/i],
      deleteOriginalAssets: false,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'react-router-dom',
            '@tanstack/react-query',
            'lucide-react',
          ],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-slot',
          ],
        },
      },
    },
    // Enable minification and optimization
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Generate source maps for production debugging
    sourcemap: true,
    // Improve chunking strategy
    chunkSizeWarningLimit: 1000,
  },
}));
