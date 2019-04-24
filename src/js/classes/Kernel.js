import Base from './Base'
import {
  encodeStrings,
  decodeStrings,
  flatten2D,
  transpose2D,
  stackPutArray,
  isArray,
  isString,
  containsOneType,
  containsNumbersOnly,
} from '../helpers'
import { getInstance } from '../initialiser'

function structureEvaluationInputs(inputs) {
  if (isArray(inputs[0])) {
    return flatten2D(transpose2D(inputs))
  }

  return inputs
}

function calculateEvaluation(inputs, inputPointer, evaluate) {
  const {
    memory: { F64 },
  } = getInstance()

  if (isArray(inputs[0])) {
    const results = Array(inputs[0].length)
      .fill(0)
      .map((val, i) =>
        evaluate(
          inputPointer + i * inputs.length * F64.BYTES_PER_ELEMENT,
          inputs.length
        )
      )

    return results
  } else {
    const results = evaluate(inputPointer, inputs.length)

    return results
  }
}

/**
 * @class
 * @property {string} name The name of the kernel.
 * @param {string} name Name of the Kernel.
 * @param {number} [pointer] Pointer to an existing Kernel in memory.
 */
class Kernel extends Base {
  /**
   * @param { string } name Name of the Kernel.
   * @param { number } [pointer] Pointer to an existing Kernel in memory.
   */
  constructor(name, pointer = null) {
    super()

    if (pointer) {
      const {
        exports: { _delete_string, _kernel_name },
      } = getInstance()

      Object.defineProperty(this, 'pointer', { value: pointer })

      const namePointer = _kernel_name(this.pointer)

      const [name] = decodeStrings(namePointer)

      Object.defineProperty(this, 'name', { value: name })

      _delete_string(namePointer)
      return
    }

    throw new Error('Kernel can currently only be initialised with a pointer.')
  }

  /**
   * Calculates the result of the kernel with `inputs`.
   *
   * @memberof Kernel
   * @param {...(number|number[])} inputs Input to the kernel. Must be at least two.
   * @returns {(number|number[])} The output of the kernel.
   * @example
   * kernel.evaluate(1, 2, 3)
   * // could for example return 2
   * @example
   * kernel.evaluate([1, 4], [2, 5], [3, 6])
   * // could for example return [3, 2]
   */
  evaluate(...inputs) {
    this._throwIfDestroyed()

    if (inputs.length < 2) {
      throw new Error('Must at least provide two inputs to evaluate.')
    }

    if (!containsOneType(inputs) || !containsNumbersOnly(inputs)) {
      throw new TypeError(
        'Provided inputs must all be of the same type, ' +
          'Array.<Number> or Number but not mixed.'
      )
    }

    const {
      exports: { _kernel_evaluate },
      memory: { F64 },
    } = getInstance()

    const stackStart = this._stackSave()

    const inputArray = structureEvaluationInputs(inputs)

    const inputPointer = stackPutArray(inputArray, F64)

    const result = calculateEvaluation(
      inputs,
      inputPointer,
      _kernel_evaluate.bind(null, this.pointer)
    )

    this._stackRestore(stackStart)

    return result
  }

  /**
   * Gets the eqution that is represended by the kernel.
   *
   * @memberof Kernel
   * @param {...string} inputSymbols Symbol for the inputs of the kernel. Must be at least two.
   * @returns {string} Array with with the equation for every output of the kernel.
   * @example
   * kernel.equation('a', 'b')
   * // could for example return ['(a+b)']
   */
  equation(...inputSymbols) {
    this._throwIfDestroyed()

    if (inputSymbols.length < 2) {
      throw new Error('Must at least provide two inputs to evaluate.')
    }

    if (!inputSymbols.every(isString)) {
      throw new TypeError('Provided inputSymbols must be strings.')
    }

    const {
      exports: { _delete_string, _kernel_equation },
      memory: { U8 },
    } = getInstance()

    const stackStart = this._stackSave()

    const encodedStrings = encodeStrings(...inputSymbols)
    const stringsPointer = stackPutArray(encodedStrings, U8)

    const resultPointer = _kernel_equation(
      this.pointer,
      stringsPointer,
      inputSymbols.length
    )

    const [result] = decodeStrings(resultPointer)

    _delete_string(resultPointer)
    this._stackRestore(stackStart)

    return result
  }

  /**
   * @readonly
   * @memberof Kernel
   */
  get [Symbol.toStringTag]() {
    return 'Kernel'
  }

  /**
   * Removes the C++ object from memory.
   * @memberof Kernel
   */
  destroy() {
    this._throwIfDestroyed()

    const {
      exports: { _kernel_destroy },
    } = getInstance()

    _kernel_destroy(this.pointer)

    super.destroy()
  }
}

export default Kernel
