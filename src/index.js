import dcgpInitializer from '../dcgp';
import KernelSetInitializer from './KernelSet';
import ExpressionInitializer from './Expression';
import KernelInitializer from './Kernel';

import { getTypedMemory } from './helpers';

export function instantiateClasses(instance) {
  return {
    Kernel: KernelInitializer(instance),
    KernelSet: KernelSetInitializer(instance),
    Expression: ExpressionInitializer(instance),
  };
}

export async function createInstance(fetch, arrayBuffer) {
  const { module, instance } = await dcgpInitializer(fetch, arrayBuffer);

  const typedMemory = getTypedMemory(instance.memory);
  Object.assign(instance.memory, typedMemory);

  const classes = instantiateClasses(instance);

  return {
    module,
    instance,
    ...classes,
  };
}

export default createInstance;
