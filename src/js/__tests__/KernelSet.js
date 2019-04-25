const fs = require('fs')
const path = require('path')
import { initialise, getInstance } from '../initialiser'
import KernelSet from '../classes/KernelSet'

describe('KernelSet', () => {
  let stackStart

  beforeAll(async () => {
    const dcgpBuffer = fs.readFileSync(path.resolve('dcgp.wasm')).buffer
    await initialise(dcgpBuffer)
    const { stackSave } = getInstance().exports

    stackStart = stackSave()
  })

  afterEach(() => {
    const { stackRestore } = getInstance().exports

    stackRestore(stackStart)
  })

  it('saves the kernels provided at construction', () => {
    const kernelIds = ['sum', 'diff', 'gaussian']
    const myKernelSet = new KernelSet(...kernelIds)

    myKernelSet.names.forEach((name, i) => {
      expect(name).toBe(kernelIds[i])
    })

    myKernelSet.destroy()
  })

  it('saves the kernels provided with the push method', () => {
    const kernelIds = ['sum', 'diff', 'sqrt']
    const myKernelSet = new KernelSet()

    kernelIds.forEach(kernelId => myKernelSet.push(kernelId))

    myKernelSet.names.forEach((name, i) => {
      expect(name).toBe(kernelIds[i])
    })

    myKernelSet.destroy()
  })

  it('saves the kernels provided with the push method and construction', () => {
    const kernelIds = ['sum', 'div', 'mul']
    const myKernelSet = new KernelSet(...kernelIds)
    myKernelSet.push('sin')

    const returnedNames = [...kernelIds, 'sin']

    myKernelSet.names.forEach((name, i) => {
      expect(name).toBe(returnedNames[i])
    })

    myKernelSet.destroy()
  })

  it('returns the kernels provided at construction', () => {
    const kernelIds = ['sum', 'diff', 'mul']
    const myKernelSet = new KernelSet(...kernelIds)

    myKernelSet.kernels.forEach((kernel, i) => {
      expect(kernel.name).toBe(kernelIds[i])
      kernel.destroy()
    })

    myKernelSet.destroy()
  })

  it('returns the kernels provided with push', () => {
    const kernelIds = ['sum', 'diff', 'mul']
    const myKernelSet = new KernelSet()

    kernelIds.forEach(kernelId => myKernelSet.push(kernelId))

    myKernelSet.kernels.forEach((kernel, i) => {
      expect(kernel.name).toBe(kernelIds[i])
      kernel.destroy()
    })

    myKernelSet.destroy()
  })

  it('returns the kernel at specfic index', () => {
    const kernelIds = ['sum', 'diff', 'mul']
    const myKernelSet = new KernelSet(...kernelIds)

    const kernel = myKernelSet.kernel(1)
    expect(kernel.name).toBe(kernelIds[1])
    kernel.destroy()

    myKernelSet.destroy()
  })

  it('forgets the previously provided kernels on clear', () => {
    const kernelIds = ['sum', 'diff', 'mul']
    const myKernelSet = new KernelSet(...kernelIds)

    myKernelSet.clear()

    expect(myKernelSet.names).toHaveLength(0)

    myKernelSet.destroy()
  })

  it('throws when using a destroy instance', () => {
    const kernelIds = ['sum', 'diff', 'mul']
    const myKernelSet = new KernelSet(...kernelIds)

    myKernelSet.destroy()

    expect(() => myKernelSet.names).toThrow()
    expect(() => myKernelSet.kernels).toThrow()
    expect(() => myKernelSet.kernel(1)).toThrow()
    expect(() => myKernelSet.clean()).toThrow()
    expect(() => myKernelSet.destroy()).toThrow()
  })
})
