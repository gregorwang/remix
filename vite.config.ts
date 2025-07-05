import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

installGlobals();

export default defineConfig({
  server: {
    port: 3000,
  },
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 为大型库创建单独的chunks
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            if (id.includes('framer-motion')) {
              return 'animations';
            }
            return 'vendor';
          }
          
          // 应用代码分割 - 避免重复bundle
          if (id.includes('app/hooks/')) {
            return 'hooks';
          }
          if (id.includes('app/lib/utils/')) {
            return 'utils';
          }
          if (id.includes('app/components/') && id.includes('.client.')) {
            return 'client-components';
          }
        },
      },
    },
    // 启用预压缩
    minify: 'esbuild',
    target: 'es2018',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@remix-run/react'],
  },
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
});
