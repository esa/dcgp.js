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

export function getTypedMemory(memory) {
  const { buffer } = memory;

  return {
    S8: new Int8Array(buffer),
    S16: new Int16Array(buffer),
    S32: new Int32Array(buffer),
    U8: new Uint8Array(buffer),
    U16: new Uint16Array(buffer),
    U32: new Uint32Array(buffer),
    F32: new Float32Array(buffer),
    F64: new Float64Array(buffer),
  };
}
