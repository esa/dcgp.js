import babel from 'rollup-plugin-babel';
import copy from 'rollup-plugin-copy';
import pkg from './package.json';
import fs from 'fs';
import path from 'path';

function emptyDir(outputDir) {
  return {
    name: 'empty-lib-dir',
    buildStart() {
      const absolutePath = path.resolve(outputDir);

      return new Promise(resolve => {
        resolve(fs.statSync(absolutePath));
      }).then(stats => {
        if (!stats.isDirectory) {
          Promise.reject('outputDir must be a directory');
        }

        const files = fs.readdirSync(absolutePath);

        for (let index = 0; index < files.length; index++) {
          fs.unlinkSync(path.join(absolutePath, files[index]));
        }

        return files;
      });
    },
  };
}

const inputDir = 'src';
const outputDir = 'lib';

export default {
  input: path.join(inputDir, 'index.js'),
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    emptyDir(outputDir),
    babel(),
    copy({
      'dcgp.wasm': path.join(outputDir, 'dcgp.wasm'),
      'dcgp.wasm.map': path.join(outputDir, 'dcgp.wasm.map'),
      [path.join(inputDir, 'index.html')]: path.join(outputDir, 'index.html'),
    }),
  ],
  output: [
    {
      format: 'umd',
      file: path.join(outputDir, 'dcgp.umd.js'),
      name: 'dcgp',
      exports: 'named',
    },
    {
      format: 'es',
      file: path.join(outputDir, 'dcgp.es.js'),
    },
  ],
};
