import babel from 'rollup-plugin-babel';
import copy from 'rollup-plugin-copy';
import pkg from './package.json';

export default {
  input: 'src/index.js',
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    babel(),
    copy({
      'dcgp.wasm': 'lib/dcgp.wasm',
      'dcgp.wasm.map': 'lib/dcgp.wasm.map',
      'src/index.html': 'lib/index.html',
    }),
  ],
  output: [
    {
      format: 'umd',
      file: 'lib/dcgp.umd.js',
      name: 'dcgp',
      exports: 'named',
    },
    {
      format: 'es',
      file: 'lib/dcgp.es.js',
    },
  ],
};
