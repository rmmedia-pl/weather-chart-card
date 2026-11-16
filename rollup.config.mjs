import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import serve from 'rollup-plugin-serve';
import copy from 'rollup-plugin-copy';

const dev = process.env.ROLLUP_WATCH;

const serveopts = {
  contentBase: ['./dist'],
  host: '0.0.0.0',
  port: 5000,
  allowCrossOrigin: true,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
};

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/weather-chart-card.js',
    // Home Assistant loads this file as `type: module` (Lovelace resource) and
    // through frontend.extra_module_url, so an ES bundle is what it expects.
    // The old 'cjs' output had no scope of its own: loaded twice as a classic
    // script it died on "Identifier has already been declared", and its
    // top-level names shared one scope with every other classic script.
    format: 'es',
    sourcemap: dev ? true : false,
  },
  plugins: [
    resolve(),
    // The unminified bundle was 666 KB. A dashboard builds its cards before
    // every resource has finished evaluating, and a card nested in another
    // custom card (tabbed-card) is not rebuilt reliably when its definition
    // arrives late - it just stays an empty tab. Shipping a quarter of the
    // bytes narrows that window; `extra_module_url` closes it.
    !dev && terser({ format: { comments: false } }),
    dev && serve(serveopts),
    copy({
      targets: [
        { src: 'src/icons/*', dest: 'dist/icons' },
        { src: 'src/icons2/*', dest: 'dist/icons2' }
      ]
    })
  ],
};
