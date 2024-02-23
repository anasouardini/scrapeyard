import { defineConfig } from 'tsup';

export default defineConfig({
  format: ['cjs', 'esm'],
  entry: ['./src/mainInterface.ts', './src/viewsInterface.ts'],
  outDir: './lib',
  dts: true,
  shims: true,
  skipNodeModulesBundle: true,
  clean: true,
});
