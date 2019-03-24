/* eslint-env node */
/* eslint-disable no-console */
const { spawn } = require('child_process')
const { join } = require('path')
const { lstatSync, readdirSync } = require('fs')
const glob = require('glob')

const cwd = process.cwd()

const isDirectory = source => lstatSync(source).isDirectory()
const getDirectories = source =>
  readdirSync(source)
    .map(name => join(source, name))
    .filter(isDirectory)

const emscriptenPath = join(cwd, 'emsdk', 'emscripten')
// assume that the emscripten folder contains one folder
// which is the version
const emccPath = join(getDirectories(emscriptenPath)[0], 'emcc')

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
