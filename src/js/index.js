export { initialise } from './initialiser'
export { default as Expression } from './classes/Expression'
export { default as KernelSet } from './classes/KernelSet'
export { default as Kernel } from './classes/Kernel'

import { default as muPlusLambda } from './algorithms/muPlusLambda'

export const algorithms = {
  muPlusLambda,
}
