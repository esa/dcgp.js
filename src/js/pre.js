/* global asm2wasmImports, removeRunDependency, addRunDependency, Module */

let importObject

// override the createWasm function to prevent emscripten from initializing
// the webassembly module. This gives us the control over the initialization.
// eslint-disable-next-line no-undef
createWasm = function createWasmOverride(env) {
  importObject = {
    env: env,
    global: {
      NaN: NaN,
      Infinity: Infinity,
    },
    'global.Math': Math,
    asm2wasm: asm2wasmImports,
  }

  addRunDependency('wasm-instantiate')

  return {}
}

async function getModuleAndInstance(fetchInstance, arrayBufferInstance) {
  let module, instance

  if (fetchInstance) {
    if (typeof WebAssembly.instantiateStreaming === 'function') {
      const wasmObject = await WebAssembly.instantiateStreaming(
        fetchInstance,
        importObject
      )

      module = wasmObject.module
      instance = wasmObject.instance
    } else {
      const body = await fetchInstance
      const bytes = await body.arrayBuffer()

      module = await WebAssembly.compile(bytes)
      instance = await WebAssembly.instantiate(bytes, importObject)
    }
  } else {
    module = await WebAssembly.compile(arrayBufferInstance)
    instance = await WebAssembly.instantiate(module, importObject)
  }

  instance.table = importObject.env.table
  instance.memory = importObject.env.memory
  Module['asm'] = instance.exports

  removeRunDependency('wasm-instantiate')

  return {
    module,
    instance,
  }
}

export default getModuleAndInstance

export async function instantiateModule(module) {
  const instance = await WebAssembly.instantiate(module, importObject)

  instance.table = importObject.env.table
  instance.memory = importObject.env.memory
  Module['asm'] = instance.exports

  removeRunDependency('wasm-instantiate')

  return {
    module,
    instance,
  }
}
