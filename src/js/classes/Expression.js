import {
  setInHEAP,
  decodeStringArray,
  encodeStringArray,
  flatten2D,
  transpose2D,
} from '../helpers'
import { getInstance } from '../initialiser'

function randomSeed() {
  return Math.round(Math.random() * 10000)
}

function structureEvaluationInputs(inputs) {
  if (Array.isArray(inputs[0])) {
    return flatten2D(transpose2D(inputs))
  }

  return inputs
}

// TODO: refactor function
function calculateEvaluation({ inputs, inputPointer, evaluate, outputs }) {
  const {
    exports: { _delete_double_array },
    memory: { F64 },
  } = getInstance()

  if (Array.isArray(inputs[0])) {
    const inputArrayLength = inputs[0].length

    const results = []
    const lengthOfInput = 1

    for (let i = 0; i < inputArrayLength; i++) {
      const resultPointer = evaluate(
        inputPointer + i * inputs.length * F64.BYTES_PER_ELEMENT,
        lengthOfInput
      )

      const typedResult = new Float64Array(F64.buffer, resultPointer, outputs)

      results.push(Array.from(typedResult))

      _delete_double_array(resultPointer)
    }

    return transpose2D(results)
  } else {
    const lengthOfInput = 1
    const resultPointer = evaluate(inputPointer, lengthOfInput)

    const typedResult = new Float64Array(F64.buffer, resultPointer, outputs)

    const results = Array.from(typedResult)

    _delete_double_array(resultPointer)

    return results
  }
}

/**
 * @typedef {import('./KernelSet').default} KernelSet
 */

/**
 * @class
 * @property {[number]} chromosome Chromosome of the Expression can be get or set.
 * @param {number} inputs Number of inputs.
 * @param {number} outputs Number of outputs
 * @param {number} rows Number of rows.
 * @param {number} columns Number of columns.
 * @param {number} levelsBack Maximum number of levels back the connections can be.
 * @param {number} arity The number of incomming connections of a node.
 * @param {KernelSet} kernelSet Instances with the kernels to be used in the expression.
 * @param {number} seed Pseudo random number generator seed.
 */
class Expression {
  constructor(
    inputs,
    outputs,
    rows,
    columns,
    levelsBack,
    arity,
    kernelSet,
    seed = randomSeed
  ) {
    const {
      exports: { _expression_constructor },
    } = getInstance()

    const calculatedSeed = typeof seed === 'function' ? seed() : seed

    const pointer = _expression_constructor(
      inputs,
      outputs,
      rows,
      columns,
      levelsBack,
      arity,
      kernelSet.pointer,
      calculatedSeed
    )

    Object.defineProperties(this, {
      pointer: { value: pointer },
      inputs: { value: inputs },
      outputs: { value: outputs },
      rows: { value: rows },
      columns: { value: columns },
      levelsBack: { value: levelsBack },
      arity: { value: arity },
      seed: { value: calculatedSeed },
    })
  }

  /**
   * @memberof Expression
   * @type {number[]}
   */
  get chromosome() {
    const {
      exports: {
        stackSave,
        stackAlloc,
        stackRestore,
        _delete_uint32_array,
        _expression_get_chromosome,
      },
      memory: { U32 },
    } = getInstance()

    const stackStart = stackSave()

    const lengthPointer = stackAlloc(Uint32Array.BYTES_PER_ELEMENT)

    const arrayPointer = _expression_get_chromosome(this.pointer, lengthPointer)

    const typedChromosome = new Uint32Array(
      U32.buffer,
      arrayPointer,
      U32[lengthPointer / U32.BYTES_PER_ELEMENT]
    )

    const chromosome = Array.from(typedChromosome)

    _delete_uint32_array(arrayPointer)
    stackRestore(stackStart)

    return chromosome
  }

  set chromosome(chromosome) {
    if (!Array.isArray(chromosome)) {
      throw 'The chromosome is not an array'
    }

    if (!chromosome.every(i => typeof i === 'number')) {
      throw 'Every entry of the chromosome must be a number'
    }

    if (!chromosome.every(i => i >= 0)) {
      throw 'Every entry of the chromosome must not be negative'
    }

    const {
      exports: {
        stackSave,
        stackAlloc,
        stackRestore,
        _expression_set_chromosome,
      },
      memory: { U32 },
    } = getInstance()

    const stackStart = stackSave()

    const typedChromosome = new Uint32Array(chromosome)
    const chromosomePointer = stackAlloc(typedChromosome.byteLength)

    setInHEAP(U32, typedChromosome, chromosomePointer)

    _expression_set_chromosome(
      this.pointer,
      chromosomePointer,
      typedChromosome.length
    )

    stackRestore(stackStart)
  }

  /**
   * Calculates the result of the expression with `inputs`.
   *
   * @memberof Expression
   * @param {...(number|[number])} inputs Input to the expression.
   * @returns {number[]} The outputs of the expression.
   * @example
   * expression.evalutate(1, 2, 3)
   * // could for example return [2, 5]
   * @example
   * kernel.evalutate([1, 4], [2, 5], [3, 6])
   * // could for example return [[2, 4], [5, 8]]
   */
  evaluate(...inputs) {
    if (inputs.length !== this.inputs) {
      throw 'Number of inputs needs to match' +
        `the number of inputs of the expression which is ${this.inputs}`
    }

    if (!inputs.every(i => typeof i === 'number' || Array.isArray(i))) {
      throw 'Every entry of inputs must be a number or an array with numbers'
    }

    const {
      exports: { stackSave, stackAlloc, stackRestore, _expression_evaluate },
      memory: { F64 },
    } = getInstance()

    const stackStart = stackSave()

    const inputArray = structureEvaluationInputs(inputs)

    const inputArrayF64 = new Float64Array(inputArray)
    const inputPointer = stackAlloc(inputArrayF64.byteLength)
    setInHEAP(F64, inputArrayF64, inputPointer)

    const results = calculateEvaluation({
      outputs: this.outputs,
      inputs,
      inputPointer,
      evaluate: _expression_evaluate.bind(null, this.pointer),
    })

    stackRestore(stackStart)

    return results
  }

  /**
   * Gets the eqution that is represended by the expression.
   *
   * @memberof Expression
   * @param {...string} inputSymbols Symbol for the inputs of the expression.
   * @returns {string[]} Array with with the equation for every output of the expression.
   * @example
   * expression.equation('a', 'b')
   * // could for example return ['(a+b)']
   */
  equations(...inputSymbols) {
    if (inputSymbols.length !== this.inputs) {
      throw 'Number of inputSymbols needs to match' +
        `the number of inputs of the expression which is ${this.inputs}`
    }

    if (!inputSymbols.every(i => typeof i === 'string')) {
      throw 'Every entry of inputSymbols must be a string'
    }
    const {
      exports: {
        stackSave,
        stackAlloc,
        stackRestore,
        _delete_string,
        _expression_equation,
      },
      memory: { U8 },
    } = getInstance()

    const stackStart = stackSave()

    const encodedStrings = encodeStringArray(inputSymbols)
    const stringsPointer = stackAlloc(encodedStrings.byteLength)
    setInHEAP(U8, encodedStrings, stringsPointer)

    const resultPointer = _expression_equation(this.pointer, stringsPointer)
    const results = decodeStringArray(U8, resultPointer, this.outputs)

    _delete_string(resultPointer)
    stackRestore(stackStart)

    return results
  }

  // // Gets the idx of the active genes in the current chromosome(numbering is from 0)
  // getActiveGenes() {}

  // // Gets the idx of the active nodes in the current chromosome
  // getActiveNodes() {}

  // // Gets the kernel functions
  // getKernels() {}

  // // Gets a vector containing the indexes in the chromosome where each node starts to be expressed.
  // getGeneIdx() {}

  // // Gets the lower bounds of the chromosome
  // getLowerBounds() {}

  // // Gets the upper bounds of the chromosome
  // getUpperBounds() {}

  // // Computes the loss of the model on the data
  // // The loss must be one of “MSE” for Mean Square Error and “CE” for Cross Entropy.
  // loss(points, labels, loss_type = 'MSE') {}

  // // Mutates multiple genes within their allowed bounds.
  // mutate(indexes) {}

  // // Mutates N randomly selected active genes within their allowed bounds
  // mutateActive(N = 1) {}

  // // Mutates N randomly selected active connections within their allowed bounds
  // mutateActiveConnections(N = 1) {}

  // // Mutates N randomly selected active function genes within their allowed bounds
  // mutateActiveFunctions(N = 1) {}

  // // Mutates N randomly selected output genes connection within their allowed bounds
  // mutateOutputs(N = 1) {}

  // // Mutates N randomly selected genes within its allowed bounds
  // mutateRandom(N = 1) {}

  // // Sets for a valid node(i.e.not an input node) a new kernel.
  // setFunction(nodeIndexes, kernelIds) {}

  /**
   * @readonly
   * @private
   */
  get [Symbol.toStringTag]() {
    return 'Expression'
  }

  /**
   * Cleans this object from the shared memory with WebAssembly.
   * Must be called before the instance goes out off scope to prevent memory leaks.
   * @memberof Expression
   */
  destroy() {
    const {
      exports: { _expression_destroy },
    } = getInstance()

    _expression_destroy(this.pointer)
  }
}

export default Expression
