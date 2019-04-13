import { stackPutArray, flatten2D } from '../helpers'
import { getInstance } from '../initialiser'

/**
 * @typedef {import('../classes/Expression').default} Expression
 */

/**
 * @function muPlusLambda
 * @memberof Algorithm
 * @param {Expression} expression Expression to evolve.
 * @param {number} mu Number of members of the population to keep alive.
 * @param {number} lambda Number of new members to generate.
 * @param {number} maxSteps Maximum amount of steps before the algorithm stop.
 * @param {[[number]]} inputs Matrix with dimentions (inputs, points). The inputs should exclude the constants.
 * @param {[[number]]} labels Matrix with dimentions (outputs, points).
 * @param {number[]} [constants] Array with ephemeral constants to be used as inputs together with `inputs`.
 * If the type of the expression is a form of 'gdual' these constants will be learned.
 * @returns {object}
 */
function muPlusLambda(
  expression,
  mu,
  lambda,
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
    exports: { stackSave, stackRestore, _algorithm_mu_plus_lambda },
  } = getInstance()

  const stackStart = stackSave()

  const [inputsPointer, labelsPointer] = [inputs, labels].map(data => {
    const flat = flatten2D(data)

    return stackPutArray(flat, F64)
  })

  const constantsPointer =
    constants.length !== 0 ? stackPutArray(constants, F64) : 0

  const loss = _algorithm_mu_plus_lambda(
    expression.pointer,
    mu,
    lambda,
    maxSteps,
    inputsPointer,
    labelsPointer,
    inputs[0].length,
    constantsPointer,
    constants.length
  )

  stackRestore(stackStart)
  return { loss }
}

export default muPlusLambda
