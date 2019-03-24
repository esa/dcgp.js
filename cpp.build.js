/* eslint-env node */
/* eslint-disable no-console */
const { spawn } = require('child_process')
const { join } = require('path')
const glob = require('glob')

const cwd = process.cwd()
const emccPath = join(cwd, 'emsdk', 'emscripten', '1.38.28', 'emcc')

glob('src/cpp/**/*.cpp', null, (error, files) => {
  if (error) {
    throw new Error(error)
  }

  let args = [
    '-o',
    'dcgp.js',
    `-I${join(cwd, 'dcgp', 'include')}`,
    `-I${join(cwd, 'audi', 'include')}`,
    '-std=c++11',
    '-g4',
    '--source-map-base',
    'http://localhost:8080/',
    '-O3',
    '--pre-js',
    join(cwd, 'src', 'js', 'pre.js'),
  ]

  args = files.concat(args)

  const emcc = spawn(emccPath, args)

  emcc.stdout.on('data', console.log)

  emcc.stderr.on('data', console.error)

  emcc.on('close', code => {
    if (code !== 0) {
      throw new Error('emcc command failed')
    }

    console.log('emcc command succeded')
  })
})
