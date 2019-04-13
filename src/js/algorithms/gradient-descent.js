import { stackPutArray, flatten2D } from '../helpers'
import { getInstance } from '../initialiser'

/**
 * @typedef {import('../classes/Expression').default} Expression
 */

/**
 * @function gradientDescent
 * @memberof Algorithm
 * @param {Expression} expression Expression to evolve the constants of.
 * @param {number} learningRate Rate at which the constants will update.
 * @param {number} maxSteps Maximum amount of steps before the algorithm stop.
 * The algorithm could stop before `maxSteps` if a loss of lower than 1e-13 is reached.
 * @param {[[number]]} inputs Matrix with dimentions (inputs, points). The inputs should exclude the constants.
 * @param {[[number]]} labels Matrix with dimentions (outputs, points).
 * @param {number[]} [constants] Array with ephemeral constants to be used as inputs together with `inputs`.
 * The gradient descent algorithm will learn the constants to minimize the Mean Squared Error.
 * @returns {object}
 */
function gradientDescent(
  expression,
  learningRate,
  maxSteps,
  inputs,
  labels,
  constants = []
) {
  if (inputs.length + constants.length !== expression.inputs) {
    throw 'The number of provided inputs is not equal to the required inputs for this expression.'
  }

  if (inputs[0].length !== labels[0].length) {
    throw 'input and output must be an array of the same length. ' +
      `Lengths ${inputs.length} and ${labels.length} found.`
  }

  const {
    memory: { F64 },
    exports: { stackSave, stackRestore, _algorithm_gradient_descent },
  } = getInstance()

  const stackStart = stackSave()

  const [inputsPointer, labelsPointer] = [inputs, labels].map(data => {
    const flat = flatten2D(data)

    return stackPutArray(flat, F64)
  })

  const constantsPointer =
    constants.length !== 0 ? stackPutArray(constants, F64) : 0

  const loss = _algorithm_gradient_descent(
    expression.pointer,
    learningRate,
    maxSteps,
    inputsPointer,
    labelsPointer,
    inputs[0].length,
    constantsPointer,
    constants.length
  )

  const typedLearnedConstants = new Float64Array(
    F64.buffer,
    constantsPointer,
    constants.length
  )

  const learnedConstants = Array.from(typedLearnedConstants)

  stackRestore(stackStart)
  return {
    loss,
    constants: learnedConstants,
  }
}

export default gradientDescent
