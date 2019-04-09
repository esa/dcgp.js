import { DCGP_TYPES } from '../constants'
import {
  setInHEAP,
  encodeStringArray,
  encodeString,
  getExportsFactory,
} from '../helpers'
import { getInstance } from '../initialiser'
import Kernel from './Kernel'

const kernelNameOptions = {
  SUM: 'sum',
  DIFF: 'diff',
  MUL: 'mul',
  DIV: 'div',
  PDIV: 'pdiv',
  SIN: 'sin',
  COS: 'cos',
  LOG: 'log',
  EXP: 'exp',
}

/**
 * @class
 * @param {[String]} kernelNames Names of the kernels to add to the set.
 * @param {('double'|'gdual_d'|'gdual_v')} [type='double']
 */
class KernelSet {
  static SUM = kernelNameOptions.SUM
  static DIFF = kernelNameOptions.DIFF
  static MUL = kernelNameOptions.MUL
  static DIV = kernelNameOptions.DIV
  static PDIV = kernelNameOptions.PDIV
  static SIN = kernelNameOptions.SIN
  static COS = kernelNameOptions.COS
  static LOG = kernelNameOptions.LOG
  static EXP = kernelNameOptions.EXP

  static ALL_KERNELS = Object.values(kernelNameOptions)

  constructor(kernelNames, type = 'double') {
    if (DCGP_TYPES.indexOf(type) === -1) {
      throw `Expression type '${type}' is invalid. Must be one of ${DCGP_TYPES}`
    }

    const getExports = getExportsFactory.bind(null, 'kernel_set', type)

    Object.defineProperties(this, {
      type: { value: type },
      getExports: { value: getExports },
    })

    const {
      exports: { stackSave, stackAlloc, stackRestore },
      memory: { U8 },
    } = getInstance()

    if (kernelNames) {
      if (!Array.isArray(kernelNames)) {
        throw 'kernelNames is not an array'
      }

      if (!kernelNames.every(i => typeof i === 'string')) {
        throw 'Every entry of kernelNames must be a string'
      }

      const [init] = getExports('constructor_1')

      const stackStart = stackSave()

      const encodedStrings = encodeStringArray(kernelNames)

      const namesPointer = stackAlloc(encodedStrings.byteLength)
      setInHEAP(U8, encodedStrings, namesPointer)

      const receivedPointer = init(namesPointer, kernelNames.length)

      Object.defineProperty(this, 'pointer', { value: receivedPointer })

      stackRestore(stackStart)
      return
    }

    const [init] = getExports('constructor_0')

    const receivedPointer = init()
    Object.defineProperty(this, 'pointer', { value: receivedPointer })
  }

  /**
   * Adds a kernel to the set.
   *
   * @memberof KernelSet
   * @param {(string|Kernel)} kernel The kernel to add by name or instance.
   */
  push(kernel) {
    const {
      exports: { stackSave, stackAlloc, stackRestore },
      memory: { U8 },
    } = getInstance()

    if (kernel instanceof Kernel) {
      const [push_back] = this.getExports('push_back_1')

      push_back(this.pointer, kernel.pointer)
      return
    }

    if (typeof kernel !== 'string') {
      throw 'kernel must be a string'
    }

    const stackStart = stackSave()

    const textArray = encodeString(kernel)
    const textPointer = stackAlloc(textArray.byteLength)
    setInHEAP(U8, textArray, textPointer)

    const [push_back] = this.getExports('push_back_0')
    push_back(this.pointer, textPointer)

    stackRestore(stackStart)
  }

  /**
   * @readonly
   * @type {[Kernel]}
   */
  get kernels() {
    const {
      exports: { stackSave, stackAlloc, stackRestore },
      memory: { U32 },
    } = getInstance()

    const stackStart = stackSave()

    const [getNumKernels, getKernels] = this.getExports(
      'num_kernels',
      'get_kernels'
    )

    const numKernels = getNumKernels(this.pointer)

    if (numKernels === 0) {
      return []
    }

    const pointersArrPointer = stackAlloc(U32.BYTES_PER_ELEMENT * numKernels)

    getKernels(this.pointer, pointersArrPointer)

    const kernelPointers = new Uint32Array(
      U32.buffer,
      pointersArrPointer,
      numKernels
    )

    const kernels = new Array(numKernels)

    for (let index = 0; index < kernelPointers.length; index++) {
      kernels[index] = new Kernel(null, null, null, kernelPointers[index])
    }

    stackRestore(stackStart)

    return kernels
  }

  /**
   * Gets the kernel at `index` of the list.
   *
   * @memberof KernelSet
   * @param {number} index Index of the kernel to return.
   * @returns {Kernel} The kernel at `index` of the set.
   */
  kernel(index) {
    const [getKernel] = this.getExports('get_kernel')

    const pointer = getKernel(this.pointer, index)

    return new Kernel(null, null, null, pointer, this.type)
  }

  /**
   * Get a string representation of the KernelSet.
   * @memberof KernelSet
   * @returns {string} The string representation of the KernelSet.
   */
  toString() {
    const kernels = this.kernels

    let stringResult = ''
    const lastIndex = kernels.length - 1

    for (let index = 0; index < lastIndex; index++) {
      stringResult += kernels[index].toString()
      stringResult += ', '
      kernels[index].destroy()
    }

    stringResult += kernels[lastIndex].toString()
    kernels[lastIndex].destroy()

    return stringResult
  }

  /**
   * Remove all kernels from the set.
   * @memberof KernelSet
   */
  clear() {
    const [clear] = this.getExports('clear')

    clear(this.pointer)
  }

  /**
   * Removes the C++ object from memory.
   * @memberof KernelSet
   */
  destroy() {
    const [destroy] = this.getExports('destroy')

    destroy(this.pointer)
  }
}

export default KernelSet
