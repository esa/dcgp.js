import DcgpModule from '../../dcgp'

/**
 * @private
 * @typedef {function} stackSave
 * @returns {number} The current top of the memory stack.
 */

/**
 * @private
 * @typedef {function} stackAlloc
 * @param {number} bytes The number of bytes to allocate on the stack.
 * @returns {number} Pointer to the allocated memory adress.
 */

/**
 * @private
 * @typedef {function} stackRestore
 * @param {number} pointer The point of the memory stack to which to restore the stack.
 */

/**
 * @private
 * @typedef {object} Instance
 * @property {object} exports Exported C++ binding functions.
 * @property {stackSave} exports.stackSave The current top of the memory stack.
 * @property {stackAlloc} exports.stackAlloc Allocates the specified amount of bytes.
 * @property {stackRestore} exports.stackRestore Restores the memory stack to the provided point.
 * @property {object} memory Shared memory representations.
 * @property {Int8Array} memory.S8 Signed 8 bit memory representation.
 * @property {Int16Array} memory.S16 Signed 16 bit memory representation.
 * @property {Int32Array} memory.S32 Signed 32 bit memory representation.
 * @property {Uint8Array} memory.U8 Unsigned 8 bit memory representation.
 * @property {Uint16Array} memory.U16 Unsigned 16 bit memory representation.
 * @property {Uint32Array} memory.U32 Unsigned 32 bit memory representation.
 * @property {Float32Array} memory.F32 Floating point 32 bit memory representation.
 * @property {Float64Array} memory.F64 Double floating point 64 bit memory representation.
 */

/**
 * @type {Instance}
 * @private
 */
let privateGlobalInstance

/**
 * @private
 * @returns {Instance}
 * @throws dcgp.js is not initialised.
 */
export const getInstance = () => {
  if (privateGlobalInstance) {
    return privateGlobalInstance
  }

  throw new Error('dcgp is not initialised. initialise must be called first.')
}

function getTypedMemory(dcgpModule) {
  return {
    S8: dcgpModule.HEAP8,
    S16: dcgpModule.HEAP16,
    S32: dcgpModule.HEAP32,
    U8: dcgpModule.HEAPU8,
    U16: dcgpModule.HEAPU16,
    U32: dcgpModule.HEAPU32,
    F32: dcgpModule.HEAPF32,
    F64: dcgpModule.HEAPF64,
  }
}

function getExports(dcgpModule) {
  const bindingKeys = Object.keys(dcgpModule)
    // emscripten prefixes exports with an underscore
    .filter(key => key.startsWith('_'))
    // remove the underscore
    .map(key => key.substr(1, key.length))
    // remove keys with more than one underscore
    .filter(key => !key.startsWith('_'))

  const exports = {
    stackSave: dcgpModule.stackSave,
    stackAlloc: dcgpModule.stackAlloc,
    stackRestore: dcgpModule.stackRestore,
  }

  bindingKeys.forEach(key => {
    exports[key] = dcgpModule[`_${key}`]
  })

  return exports
}

function internalInitialise(moduleObject) {
  return new Promise(resolve => {
    DcgpModule(moduleObject).then(dcgpModule => {
      // prevent an infinite loop: https://github.com/emscripten-core/emscripten/issues/5820
      delete dcgpModule.then
      resolve(dcgpModule)
    })
  })
}

/**
 * @returns {boolean} if the dcgp dcgpModule is initialised
 */
export function isInitialised() {
  return !!privateGlobalInstance
}

/**
 * Initialises the WebAssembly backend.
 * Needs to be called and fininished before any other methodes or classes can be used.
 *
 * @async
 * @param {string} fileLocation either the wasm
 */
export async function initialise(fileLocation) {
  if (isInitialised()) {
    return
  }

  const locateFile = fileLocation
    ? (path, prefix) => {
        if (path.endsWith('.wasm')) {
          return fileLocation
        }

        // keep default behaviour for non wasm files
        return prefix + path
      }
    : undefined

  const dcgpModule = await internalInitialise({ locateFile })

  const memory = getTypedMemory(dcgpModule)
  const exports = getExports(dcgpModule)

  privateGlobalInstance = { memory, exports }
}
