import path from 'path';
import fg from 'fast-glob';

const dirname = path.dirname(new URL(import.meta.url).pathname);
const paths = await fg.glob(path.resolve(dirname, 'src') + '/**/*.html');
const inputs = paths.reduce((acc, cur) => {
  const key = cur
    .replace(`${path.resolve(dirname, 'src')}/`, '')
    .replace('.html', '');
  acc[key] = cur;
  return acc;
}, {});

// vite.config.js
export default {
  root: path.resolve(dirname, 'src'),
  build: {
    outDir: path.resolve(dirname, 'dist'),
    rollupOptions: {
      input: inputs,
    },
  },
};
