export { initialise } from './initialiser'
export { default as Expression } from './classes/Expression'
export { default as KernelSet } from './classes/KernelSet'
export { default as Kernel } from './classes/Kernel'

import { default as muPlusLambda } from './algorithms/mu-plus-lambda'
import { default as gradientDescent } from './algorithms/gradient-descent'

/**
 * @namespace Algorithm
 */
export const algorithms = {
  muPlusLambda,
  gradientDescent,
}