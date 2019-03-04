export const encoder = new TextEncoder();
export const decoder = new TextDecoder('utf-8');

export function encodeStringArray(stringArray) {
  const concatedStrings = stringArray.join('');
  const stringsIntArray = encoder.encode(concatedStrings);

  const stringsLengths = stringArray.map(str => str.length);
  const typedStringsLengths = new Uint16Array(stringsLengths);

  return {
    strings: stringsIntArray,
    lengths: typedStringsLengths,
  };
}

export function setInHEAP(HEAP, typedArray, pointer) {
  HEAP.set(typedArray, pointer / typedArray.BYTES_PER_ELEMENT);
}

// export function extractInstance(instance, memory) {
//   const { buffer } = memory;
//   const { exports } = instance;

//   return {
//     HEAP8: new Int8Array(buffer),
//     HEAP16: new Int16Array(buffer),
//     HEAP32: new Int32Array(buffer),
//     HEAPU8: new Uint8Array(buffer),
//     HEAPU16: new Uint16Array(buffer),
//     HEAPU32: new Uint32Array(buffer),
//     HEAPF32: new Float32Array(buffer),
//     HEAPF64: new Float64Array(buffer),
//     wasm: exports,
//   };
// }
