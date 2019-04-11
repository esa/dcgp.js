import { setInHEAP, flatten2D } from '../helpers'
import { getInstance } from '../initialiser'

/**
 * @typedef {import('../classes/Expression').default} Expression
 */

/**
 * @namespace Algorithm
 * @param {Expression} expression Expression to evolve.
 * @param {number} mu Number of members of the population to keep alive.
 * @param {number} lambda Number of new members to generate.
 * @param {number} maxGenerations Maximum amount of generations before the algorithm stop.
 * @param {[[number]]} inputs Inputs to the `expression` excluding constants.
 * @param {[[number]]} labels The ground truth, the target outputs.
 * @param {[number]} [constants] Ephemeral constants to be used in addition to `inputs`.
 * If the type of the expression is a form of 'gdual' these constants will be learned.
 * @returns {object}
 */
function muPlusLambda(
  expression,
  mu,
  lambda,
  maxGenerations,
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
    exports: { stackAlloc, stackSave, stackRestore, _algorithm_mu_plus_lambda },
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

  const loss = _algorithm_mu_plus_lambda(
    expression.pointer,
    mu,
    lambda,
    maxGenerations,
    data.inputs.pointer,
    data.labels.pointer,
    inputs.length,
    constantsPointer,
    constants.length
  )

  const { chromosome } = expression

  stackRestore(stackStart)
  return {
    loss,
    chromosome,
  }
}

export default muPlusLambda
