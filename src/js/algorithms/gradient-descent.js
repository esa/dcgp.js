import { setInHEAP, flatten2D } from '../helpers'
import { getInstance } from '../initialiser'

/**
 * @typedef {import('../classes/Expression').default} Expression
 */

/**
 * @param {Expression} expression Expression to evolve the constants of.
 * @param {number} learningRate Rate at which the constants will update.
 * @param {number} maxSteps Maximum amount of steps before the algorithm stop.
 * The algorithm could stop before `maxSteps` if a loss of lower than 1e-13 is reached.
 * @param {[[number]]} inputs Inputs to the `expression` excluding constants.
 * @param {[[number]]} labels The ground truth, the target outputs.
 * @param {[number]} [constants] Ephemeral constants to be used in addition to `inputs`.
 * The gradient descent algorithm will learn the constants to minimize the Mean Squared Error.
 */
export default function gradientDescent(
  expression,
  learningRate,
  maxSteps,
  inputs,
  labels,
  constants = []
) {
  if (inputs.length !== labels.length) {
    throw 'input and output must be an array of the same length. ' +
      `Lengths ${inputs.length} and ${labels.length} found.`
  }

  const {
    memory: { F64 },
    exports: {
      stackAlloc,
      stackSave,
      stackRestore,
      _algorithm_gradient_descent,
    },
  } = getInstance()

  const stackStart = stackSave()

  const data = {
    inputs: {
      raw: inputs,
    },
    labels: {
      raw: labels,
    },
  }

  Object.keys(data).forEach(key => {
    const flat = flatten2D(data[key].raw)

    const flatDouble = new Float64Array(flat)

    const pointer = stackAlloc(flatDouble.byteLength)

    setInHEAP(F64, flatDouble, pointer)

    data[key].pointer = pointer
  })

  let constantsPointer = 0
  if (constants.length !== 0) {
    const typedConstants = new Float64Array(constants)

    constantsPointer = stackAlloc(typedConstants.byteLength)

    setInHEAP(F64, typedConstants, constantsPointer)
  }

  const loss = _algorithm_gradient_descent(
    expression.pointer,
    learningRate,
    maxSteps,
    data.inputs.pointer,
    data.labels.pointer,
    inputs.length,
    constantsPointer,
    constants.length
  )

  const { chromosome } = expression

  const typedLearnedConstants = new Float64Array(
    F64.buffer,
    constantsPointer,
    constants.length
  )

  const learnedConstants = Array.from(typedLearnedConstants)

  stackRestore(stackStart)
  return {
    loss,
    chromosome,
    constants: learnedConstants,
  }
}
