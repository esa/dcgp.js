import { encodeStringArray, encodeString, stackPutArray } from '../helpers'
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

  constructor(kernelNames) {
    const {
      exports: {
        stackSave,
        stackRestore,
        _kernel_set_constructor_0,
        _kernel_set_constructor_1,
      },
      memory: { U8 },
    } = getInstance()

    if (kernelNames) {
      if (!Array.isArray(kernelNames)) {
        throw 'kernelNames is not an array'
      }

      if (!kernelNames.every(i => typeof i === 'string')) {
        throw 'Every entry of kernelNames must be a string'
      }

      const stackStart = stackSave()

      const encodedStrings = encodeStringArray(kernelNames)
      const namesPointer = stackPutArray(encodedStrings, U8)

      const receivedPointer = _kernel_set_constructor_1(
        namesPointer,
        kernelNames.length
      )

      Object.defineProperty(this, 'pointer', { value: receivedPointer })

      stackRestore(stackStart)
      return
    }

    const receivedPointer = _kernel_set_constructor_0()
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
      exports: {
        stackSave,
        stackRestore,
        _kernel_set_push_back_0,
        _kernel_set_push_back_1,
      },
      memory: { U8 },
    } = getInstance()

    if (kernel instanceof Kernel) {
      _kernel_set_push_back_1(this.pointer, kernel.pointer)
      return
    }

    if (typeof kernel !== 'string') {
      throw 'kernel must be a string'
    }

    const stackStart = stackSave()

    const textArray = encodeString(kernel)
    const textPointer = stackPutArray(textArray, U8)

    _kernel_set_push_back_0(this.pointer, textPointer)

    stackRestore(stackStart)
  }

  /**
   * @readonly
   * @type {[Kernel]}
   */
  get kernels() {
    const {
      exports: {
        stackSave,
        stackAlloc,
        stackRestore,
        _kernel_set_num_kernels,
        _kernel_set_get_kernels,
      },
      memory: { U32 },
    } = getInstance()

    const stackStart = stackSave()

    const numKernels = _kernel_set_num_kernels(this.pointer)

    if (numKernels === 0) {
      return []
    }

    const pointersArrPointer = stackAlloc(U32.BYTES_PER_ELEMENT * numKernels)

    _kernel_set_get_kernels(this.pointer, pointersArrPointer)

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
    const {
      exports: { _kernel_set_get_kernel },
    } = getInstance()

    const pointer = _kernel_set_get_kernel(this.pointer, index)

    return new Kernel(null, null, null, pointer)
  }

  /**
   * Get the names of the Kernels in the Set.
   * @readonly
   * @memberof KernelSet
   * @type {string[]} The names of the Kernels in the set.
   */
  get names() {
    const names = this.kernels.map(kernel => {
      const name = kernel.name

      kernel.destroy()

      return name
    })

    return names
  }

  /**
   * @readonly
   * @private
   */
  get [Symbol.toStringTag]() {
    return 'KernelSet'
  }

  /**
   * Remove all kernels from the set.
   * @memberof KernelSet
   */
  clear() {
    const {
      exports: { _kernel_set_clear },
    } = getInstance()

    _kernel_set_clear(this.pointer)
  }

  /**
   * Removes the C++ object from memory.
   * @memberof KernelSet
   */
  destroy() {
    const {
      exports: { _kernel_set_destroy },
    } = getInstance()

    _kernel_set_destroy(this.pointer)
  }
}

export default KernelSet
