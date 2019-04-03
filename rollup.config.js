import babel from 'rollup-plugin-babel'
import copy from 'rollup-plugin-copy'
import resolve from 'rollup-plugin-node-resolve'
import pkg from './package.json'
import fs from 'fs'
import path from 'path'

function emptyDir(outputDir) {
  return {
    name: 'empty-lib-dir',
    buildStart() {
      const absolutePath = path.resolve(outputDir)

      return new Promise(resolve => {
        resolve(fs.statSync(absolutePath))
      })
        .then(stats => {
          if (!stats.isDirectory) {
            Promise.reject('outputDir must be a directory')
          }

          const files = fs.readdirSync(absolutePath)

          for (let index = 0; index < files.length; index++) {
            fs.unlinkSync(path.join(absolutePath, files[index]))
          }

          return files
        })
        .catch(() => {})
    },
  }
}

export default {
  input: 'src/js/index.js',
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    emptyDir('lib'),
    resolve(),
    babel(),
    copy({
      'dcgp.wasm': 'lib/dcgp.wasm',
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
}
