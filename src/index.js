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

function getFetchAndArrayBuffer(fetchOrArrayBuffer) {
  let fetchInstance, arrayBufferInstance;

  // check if user provides an ArrayBuffer of the dcgp.wasm file
  if (fetchOrArrayBuffer instanceof ArrayBuffer) {
    arrayBufferInstance = fetchOrArrayBuffer;

    // check if the user provides a Promise
    // which is asumed to come from a fetch request
    // and will resolve with the dcgp.wasm response
  } else if (fetchOrArrayBuffer instanceof Promise) {
    fetchInstance = fetchOrArrayBuffer;
  } else {
    throw new Error(
      'dcgp must be initialised with an ArrayBuffer or a fetch request of the dcgp.wasm file'
    );
  }

  return {
    fetchInstance,
    arrayBufferInstance,
  };
}

export async function createInstance(fetchOrArrayBuffer) {
  const { fetchInstance, arrayBufferInstance } = getFetchAndArrayBuffer(
    fetchOrArrayBuffer
  );
  const { module, instance } = await dcgpInitializer(
    fetchInstance,
    arrayBufferInstance
  );

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
