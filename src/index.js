import dcgpInitializer from '../dcgp';
import KernelSetInitializer from './KernelSet';
import ExpressionInitializer from './Expression';
import KernelInitializer from './Kernel';

// import { extractInstance } from './helpers';

// async function getModuleAndInstance(fetch, arrayBuffer, importObject) {
//   let module, instance;

//   if (fetch) {
//     if (typeof WebAssembly.instantiateStreaming === 'function') {
//       const wasmObject = await WebAssembly.instantiateStreaming(
//         fetch,
//         importObject
//       );

//       module = wasmObject.module;
//       instance = wasmObject.instance;
//     } else {
//       const body = await fetch;
//       const bytes = await body.arrayBuffer();

//       module = WebAssembly.compile(bytes);
//       instance = WebAssembly.instantiate(bytes, importObject);
//     }
//   } else {
//     module = WebAssembly.compile(arrayBuffer);
//     instance = WebAssembly.instantiate(module, importObject);
//   }

//   return {
//     module,
//     instance,
//   };
// }

// export function instantiateClasses(instance, memory) {

//   const extractedObject = extractInstance(instance, memory);

//   return {
//     Kernel: KernelInitializer(extractedObject),
//     KernelSet: KernelSetInitializer(extractedObject),
//     // Expression: ExpressionInitializer(extractedObject),
//   };
// }

export function instantiateClasses(dcgp) {
  return {
    Kernel: KernelInitializer(dcgp),
    KernelSet: KernelSetInitializer(dcgp),
    Expression: ExpressionInitializer(dcgp),
  };
}

// export async function createInstance(fetch, arrayBuffer) {
export function createInstance() {
  // const memory = new WebAssembly.Memory({ initial: 10, maximum: 256 });

  // const table = new WebAssembly.Table({
  //   initial: 8960,
  //   maximum: 8960,
  //   element: 'anyfunc',
  // });

  // const importObject = {
  //   env: { memory, table, abortStackOverflow, abort: console.error },
  //   global: {
  //     NaN: NaN,
  //     Infinity: Infinity,
  //   },
  //   'global.Math': Math,
  // };

  // const { module, instance } = await getModuleAndInstance(
  //   fetch,
  //   arrayBuffer,
  //   importObject
  // );
  const dcgp = dcgpInitializer();

  // const classes = instantiateClasses(instance, memory);
  const classes = instantiateClasses(dcgp);

  return {
    // module,
    // instance,
    ...classes,
  };
}

export default createInstance;
