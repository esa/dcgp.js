/* eslint-env node */
/* eslint-disable no-console */
const { spawn } = require('child_process')
const { join } = require('path')
const glob = require('glob')

const DEBUG = process.env.NODE_ENV === 'development'

const INCLUDE_DIR = join('/usr', 'local', 'include')
const LIBRARY_DIR = join('/usr', 'local', 'lib')
const bitFile = 'dcgp.bc'
const optimalisation = DEBUG ? '-O0' : '-O3'

const bitArgs = [
  `-I${INCLUDE_DIR}`,
  '-I/usr/include/eigen3',
  '-std=c++11',
  '-g4',
  optimalisation,
  '-o',
  bitFile,
  DEBUG && '--source-map-base',
  DEBUG && 'http://localhost:8080/',
].filter(item => !!item)

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
  '-s',
  'EXPORT_ES6=1',
  '-s',
  'MODULARIZE=1',
  '-o',
  'dcgp.js',
  DEBUG && '--source-map-base',
  DEBUG && 'http://localhost:8080/',
].filter(item => !!item)

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

const resolveCppFiles = () =>
  new Promise((resolve, reject) => {
    glob('src/cpp/**/*.cpp', null, (error, files) => {
      if (error) {
        reject(error)
        return
      }
      resolve(files)
    })
  })

const main = async () => {
  const files = await resolveCppFiles()
  await build(files)
}

main().catch(error => console.warn(error))
