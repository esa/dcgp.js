// get the TextEncoder in browser and node.js
function getEncoder(...args) {
  let EncoderClass

  if (typeof TextEncoder !== 'undefined') {
    // eslint-disable-next-line no-undef
    EncoderClass = TextEncoder
  } else if (typeof require !== 'undefined') {
    // eslint-disable-next-line no-undef
    const util = require('util')
    EncoderClass = util.TextEncoder
  } else {
    throw new Error(
      'The TextEncoder class is not available in your environment'
    )
  }

  return new EncoderClass(...args)
}

// get the TextDecoder in browser and node.js
function getDecoder(...args) {
  let DecoderClass

  if (typeof TextDecoder !== 'undefined') {
    // eslint-disable-next-line no-undef
    DecoderClass = TextDecoder
  } else if (typeof require !== 'undefined') {
    // eslint-disable-next-line no-undef
    const util = require('util')
    DecoderClass = util.TextEncoder
  } else {
    throw new Error(
      'The TextEncoder class is not available in your environment'
    )
  }

  return new DecoderClass(...args)
}

export const encoder = getEncoder()
export const decoder = getDecoder('utf-8')

export function encodeStringArray(stringArray) {
  const concatedStrings = stringArray.join('\0') + '\0'
  const stringsIntArray = encoder.encode(concatedStrings)

  const stringsLengths = stringArray.map(str => str.length)
  const typedStringsLengths = new Uint32Array(stringsLengths)

  return {
    strings: stringsIntArray,
    lengths: typedStringsLengths,
  }
}

export function setInHEAP(HEAP, typedArray, pointer) {
  HEAP.set(typedArray, pointer / typedArray.BYTES_PER_ELEMENT)
}

export function getTypedMemory(memory) {
  const { buffer } = memory

  return {
    S8: new Int8Array(buffer),
    S16: new Int16Array(buffer),
    S32: new Int32Array(buffer),
    U8: new Uint8Array(buffer),
    U16: new Uint16Array(buffer),
    U32: new Uint32Array(buffer),
    F32: new Float32Array(buffer),
    F64: new Float64Array(buffer),
  }
}

export function flatten(array2D) {
  const flat = []

  for (const row of array2D) {
    for (const item of row) {
      flat.push(item)
    }
  }

  return flat
}
