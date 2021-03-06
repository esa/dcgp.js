import Base from './Base'
import { encodeStrings, stackPutArray } from '../helpers'
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
  GAUSSIAN: 'gaussian',
  SQRT: 'sqrt',
}

/**
 * @class
 * @param {...String } [kernelNames] Names of the kernels to add to the set.
 */
class KernelSet extends Base {
  static SUM = kernelNameOptions.SUM
  static DIFF = kernelNameOptions.DIFF
  static MUL = kernelNameOptions.MUL
  static DIV = kernelNameOptions.DIV
  static PDIV = kernelNameOptions.PDIV
  static SIN = kernelNameOptions.SIN
  static COS = kernelNameOptions.COS
  static LOG = kernelNameOptions.LOG
  static EXP = kernelNameOptions.EXP
  static GAUSSIAN = kernelNameOptions.GAUSSIAN
  static SQRT = kernelNameOptions.SQRT

  static ALL_KERNELS = Object.values(kernelNameOptions)

  /**
   * @param {...String } [kernelNames] Names of the kernels to add to the set.
   */
  constructor(...kernelNames) {
    super()

    const {
      exports: { kernel_set_constructor_0, kernel_set_constructor_1 },
      memory: { U8 },
    } = getInstance()

    if (kernelNames.length > 0) {
      const options = Object.values(kernelNameOptions)

      kernelNames.forEach(kernelName => {
        if (options.indexOf(kernelName) === -1) {
          throw new TypeError(
            `Provided kernelName ${kernelName} is not a valid kernel identifier.`
          )
        }
      })

      const stackStart = this._stackSave()

      const encodedStrings = encodeStrings(...kernelNames)
      const namesPointer = stackPutArray(encodedStrings, U8)

      const receivedPointer = kernel_set_constructor_1(
        namesPointer,
        kernelNames.length
      )

      Object.defineProperty(this, 'pointer', { value: receivedPointer })

      this._stackRestore(stackStart)
      return
    }

    const receivedPointer = kernel_set_constructor_0()
    Object.defineProperty(this, 'pointer', { value: receivedPointer })
  }

  /**
   * Adds a kernel to the set.
   *
   * @memberof KernelSet
   * @param {(string|Kernel)} kernel The kernel to add by name or instance.
   */
  push(kernel) {
    this._throwIfDestroyed()

    const {
      exports: { kernel_set_push_back_0, kernel_set_push_back_1 },
      memory: { U8 },
    } = getInstance()

    if (kernel instanceof Kernel) {
      kernel_set_push_back_1(this.pointer, kernel.pointer)
      return
    }

    const options = Object.values(kernelNameOptions)

    if (options.indexOf(kernel) === -1) {
      throw new TypeError(
        `Provided kernel is not an instance of a Kernel or a valid kernel identifier.`
      )
    }

    const stackStart = this._stackSave()

    const textArray = encodeStrings(kernel)
    const textPointer = stackPutArray(textArray, U8)

    kernel_set_push_back_0(this.pointer, textPointer)

    this._stackRestore(stackStart)
  }

  /**
   * @readonly
   * @type {[Kernel]}
   */
  get kernels() {
    this._throwIfDestroyed()

    const {
      exports: { kernel_set_num_kernels, kernel_set_get_kernels },
      memory: { U32 },
    } = getInstance()

    const stackStart = this._stackSave()

    const numKernels = kernel_set_num_kernels(this.pointer)

    if (numKernels === 0) {
      return []
    }

    const pointersArrPointer = this._stackAlloc(
      U32.BYTES_PER_ELEMENT * numKernels
    )

    kernel_set_get_kernels(this.pointer, pointersArrPointer)

    const kernelPointers = new Uint32Array(
      U32.buffer,
      pointersArrPointer,
      numKernels
    )

    const kernels = new Array(numKernels)

    for (let index = 0; index < kernelPointers.length; index++) {
      kernels[index] = new Kernel(null, kernelPointers[index])
    }

    this._stackRestore(stackStart)

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
    this._throwIfDestroyed()

    const {
      exports: { kernel_set_get_kernel, kernel_set_num_kernels },
    } = getInstance()

    const numKernels = kernel_set_num_kernels(this.pointer)
    const maxIndex = numKernels - 1

    if (index > maxIndex) {
      throw new RangeError(
        `Provided index ${index} but the maximal index is ${maxIndex}.`
      )
    }

    const pointer = kernel_set_get_kernel(this.pointer, index)

    return new Kernel(null, pointer)
  }

  /**
   * Get the names of the Kernels in the Set.
   * @readonly
   * @memberof KernelSet
   * @type {string[]} The names of the Kernels in the set.
   */
  get names() {
    this._throwIfDestroyed()

    const names = this.kernels.map(kernel => {
      const name = kernel.name

      kernel.destroy()

      return name
    })

    return names
  }

  /**
   * @readonly
   * @memberof KernelSet
   * @type {string} The string 'KernelSet'
   */
  get [Symbol.toStringTag]() {
    return 'KernelSet'
  }

  /**
   * Remove all kernels from the set.
   * @memberof KernelSet
   */
  clear() {
    this._throwIfDestroyed()

    const {
      exports: { kernel_set_clear },
    } = getInstance()

    kernel_set_clear(this.pointer)
  }

  /**
   * Removes the C++ object from memory.
   * @memberof KernelSet
   */
  destroy() {
    this._throwIfDestroyed()

    const {
      exports: { kernel_set_destroy },
    } = getInstance()

    kernel_set_destroy(this.pointer)

    super.destroy()
  }
}

export default KernelSet
