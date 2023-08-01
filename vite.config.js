import path from 'path';
// vite.config.js
const dirname = path.dirname(new URL(import.meta.url).pathname);
export default {
  root: path.resolve(dirname, 'src'),
  build: {
    outDir: path.resolve(dirname, 'dist'),
    rollupOptions: {
      input: {
        'view-transitions-api': path.resolve(
          dirname,
          'src',
          'view-transitions-api/index.html'
        ),
        'view-transitions-api/detail/01': path.resolve(
          dirname,
          'src',
          'view-transitions-api/detail/01/index.html'
        ),
        'view-transitions-api/detail/02': path.resolve(
          dirname,
          'src',
          'view-transitions-api/detail/02/index.html'
        ),
        'view-transitions-api/detail/03': path.resolve(
          dirname,
          'src',
          'view-transitions-api/detail/03/index.html'
        ),
      },
    },
  },
};
