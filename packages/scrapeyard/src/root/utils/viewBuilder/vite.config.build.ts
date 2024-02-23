import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
// import react from '@vitejs/plugin-react';
import cssByJs from 'vite-plugin-css-injected-by-js';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  logLevel: 'info',
  plugins: [react(), cssByJs(), tsconfigPaths()],
  // resolve: {
  //   alias: {
  //     "$": path.resolve(__dirname, "../../../../"),
  //     "$utils": path.resolve(__dirname, "../"),
  //     "$ui": path.resolve(__dirname, "../../ui/"),
  //   },
  // },
  build: {
    minify: false,
    emptyOutDir: false,
    // changing the dist dir for easier automation
    outDir:
      '/home/venego/home/dev/web/automation/scrapeyard-v4/src/projects/dreamjob/ui/views/build',
    rollupOptions: {
      input: {
        sendJobRequests:
          '/home/venego/home/dev/web/automation/scrapeyard-v4/src/projects/dreamjob/ui/views/src/sendJobRequests.tsx',
      },
      output: {
        // to bundle everything
        manualChunks: undefined,
        // to prevent the hashes suffixes and /dist/assets dir
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
});
