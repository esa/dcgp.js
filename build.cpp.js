/* eslint-env node */
/* eslint-disable no-console */
const { spawn } = require('child_process')
const { join } = require('path')
const glob = require('glob')

const cwd = process.cwd()
const INCLUDE_DIR = join('/usr', 'local', 'include')
const LIBRARY_DIR = join('/usr', 'local', 'lib')
const bitFile = 'dcgp.bc'
const optimalisation = '-O0'

const bitArgs = [
  `-I${INCLUDE_DIR}`,
  '-I/usr/include/eigen3',
  '-std=c++11',
  '--cache',
  join(cwd, 'cache'),
  optimalisation,
  '-o',
  bitFile,
]

const wasmArgs = [
  bitFile,
  join(LIBRARY_DIR, 'libmpfr.a'),
  join(LIBRARY_DIR, 'libgmpxx.a'),
  join(LIBRARY_DIR, 'libgmp.a'),
  join(LIBRARY_DIR, 'libboost_chrono.so'),
  join(LIBRARY_DIR, 'libboost_iostreams.so'),
  join(LIBRARY_DIR, 'libboost_prg_exec_monitor.so'),
  join(LIBRARY_DIR, 'libboost_regex.so'),
  join(LIBRARY_DIR, 'libboost_serialization.so'),
  join(LIBRARY_DIR, 'libboost_system.so'),
  join(LIBRARY_DIR, 'libboost_timer.so'),
  join(LIBRARY_DIR, 'libboost_wserialization.so'),
  optimalisation,
  '-g4',
  '--cache',
  join(cwd, 'cache'),
  '--pre-js',
  join(cwd, 'src', 'js', 'pre.js'),
  '-o',
  'dcgp.js',
]

const attachOutput = (commandClass, command) =>
  new Promise((resolve, reject) => {
    commandClass.stdout.on('data', data => {
      console.log(data.toString('utf8'))
    })

    commandClass.stderr.on('data', data => {
      console.error(data.toString('utf8'))
      reject()
    })

    commandClass.on('close', code => {
      if (code !== 0) {
        throw new Error(`${command} command failed`)
      }

      console.log(`${command} command succeeded`)
      resolve()
    })
  })

const build = async files => {
  {
    const args = files.concat(bitArgs)
    const emccProcess = spawn('emcc', args)
    await attachOutput(emccProcess, 'bitcode')
  }
  {
    const wasm = spawn('emcc', wasmArgs)
    await attachOutput(wasm, 'wasm')
  }
}

glob('src/cpp/**/*.cpp', null, (error, files) => {
  if (error) {
    throw new Error(error)
  }

  // error is not necessarily an error.
  build(files).catch(error => console.warn(error))
})
