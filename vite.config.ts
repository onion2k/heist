import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { defineConfig } from 'vite';

// Where the renderer actually is: inside node_modules when installed, a
// checkout elsewhere on the disk when linked. Its workers are fetched by URL,
// so the dev server must be allowed to serve from there.
const renderer = dirname(createRequire(import.meta.url).resolve('artshape-render/package.json'));

export default defineConfig({
  server: { port: 5175, fs: { allow: ['.', renderer] } },
  // TypeScript sources, not a build: transformed like the page's own code, and
  // its workers left addressed relative to their own module
  optimizeDeps: { exclude: ['artshape-render'] },
  build: { target: 'es2022' },
});
