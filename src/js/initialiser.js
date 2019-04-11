import dcgpInitializer, { instantiateModule } from '../../dcgp'

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
let semiGlobalInstance

/**
 * @private
 * @returns {Instance}
 * @throws Dcgp.js is not initialised.
 */
export const getInstance = () => {
  if (semiGlobalInstance) {
    return semiGlobalInstance
  }

  throw 'initialise must be called first.'
}

function getTypedMemory(memory) {
  const { buffer } = memory

  return {
    S8: new Int8Array(buffer),
    S16: new Int16Array(buffer),
    S32: new Int32Array(buffer),
    U8: new Uint8Array(buffer),
    U16: new Uint16Array(buffer),
    U32: new Uint32Array(buffer),
    F32: new Float32Array(buffer),
    F64: new Float64Array(buffer),
  }
}

function getFetchAndArrayBuffer(fetchOrArrayBuffer) {
  let fetchInstance, arrayBufferInstance

  // check if user provides an ArrayBuffer of the dcgp.wasm file
  if (fetchOrArrayBuffer instanceof ArrayBuffer) {
    arrayBufferInstance = fetchOrArrayBuffer

    // check if the user provides a Promise
    // which is asumed to come from a fetch request
    // and will resolve with the dcgp.wasm response
  } else if (fetchOrArrayBuffer instanceof Promise) {
    fetchInstance = fetchOrArrayBuffer
  } else {
    throw new Error(
      'dcgp must be initialised with an ArrayBuffer or a fetch request of the dcgp.wasm file'
    )
  }

  return {
    fetchInstance,
    arrayBufferInstance,
  }
}

async function getModuleAndInstance(wasmInput) {
  if (wasmInput instanceof WebAssembly.Module) {
    return instantiateModule(wasmInput)
  } else {
    const { fetchInstance, arrayBufferInstance } = getFetchAndArrayBuffer(
      wasmInput
    )

    return await dcgpInitializer(fetchInstance, arrayBufferInstance)
  }
}

/**
 * Initialises the WebAssembly backend.
 * Needs to be called and fininished before any other methodes or classes can be used.
 *
 * @async
 * @param {(Fetch|ArrayBuffer|WebAssembly.Module)} wasmInput
 * @returns {Promise<WebAssembly.Module>}
 */
export async function initialise(wasmInput) {
  const { module, instance } = await getModuleAndInstance(wasmInput)

  const typedMemory = getTypedMemory(instance.memory)
  Object.assign(instance.memory, typedMemory)

  semiGlobalInstance = instance

  return module
}
