const fs = require('fs')
const path = require('path')
import { initialise } from '../initialiser'

describe('initialiser', () => {
  let wasmModule
  let dcgpBuffer

  beforeAll(async () => {
    dcgpBuffer = fs.readFileSync(path.resolve('dcgp.wasm')).buffer
    wasmModule = await initialise(dcgpBuffer)
  })

  it('returns WebAssembly.Module', () => {
    expect(wasmModule).toBeInstanceOf(WebAssembly.Module)
  })

  it('throws on second call', () => {
    expect(initialise(dcgpBuffer)).rejects.toThrow()
  })
})
