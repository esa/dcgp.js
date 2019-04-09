import { DCGP_TYPES } from './constants'
import { getInstance } from './initialiser'

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

/**
 * Encodes a strings array in a c_string array.
 *
 * @private
 * @param {[string]} stringArray Array of strings to encode.
 * @returns {Uint8Array} Encoded strings.
 */
export function encodeStringArray(stringArray) {
  const concatedStrings = stringArray.join('\0') + '\0'

  const stringsIntArray = encoder.encode(concatedStrings)
  return stringsIntArray
}

/**
 * Encodes a string as c_string.
 *
 * @private
 * @param {string} string String to encode.
 * @returns {Uint8Array} Encoded string.
 */
export function encodeString(string) {
  const concatedStrings = string + '\0'

  const stringIntArray = encoder.encode(concatedStrings)
  return stringIntArray
}

/**
 * Decodes a c_string array from the shared memery with WebAssembly.
 *
 * @private
 * @param {TypedArray} heap Representation of the shared memory with WebAssembly.
 * @param {number} pointer Pointer to the start of the string.
 * @param {number} numStrings Number of strings in the array.
 * @returns {[string]} Decoded strings.
 */
export function decodeStringArray(heap, pointer, numStrings) {
  let foundNullChars = 0
  let totalLength

  for (let index = pointer; index < heap.length; index++) {
    if (heap[index] === 0) {
      foundNullChars++

      if (foundNullChars === numStrings) {
        totalLength = index - pointer
        break
      }
    }
  }

  const stringsIntArray = new Uint8Array(heap.buffer, pointer, totalLength)
  const concatedStrings = decoder.decode(stringsIntArray)

  const stringArray = concatedStrings.split('\0')
  return stringArray
}

/**
 * Decodes a c_string from the shared memery with WebAssembly.
 *
 * @private
 * @param {TypedArray} heap Representation of the shared memory with WebAssembly.
 * @param {number} pointer Pointer to the start of the string.
 * @returns {string} Decoded string.
 */
export function decodeString(heap, pointer) {
  let totalLength

  for (let index = pointer; index < heap.length; index++) {
    if (heap[index] === 0) {
      totalLength = index - pointer
      break
    }
  }

  const stringsIntArray = new Uint8Array(heap.buffer, pointer, totalLength)
  const decodedString = decoder.decode(stringsIntArray)
  return decodedString
}

export function setInHEAP(HEAP, typedArray, pointer) {
  HEAP.set(typedArray, pointer / typedArray.BYTES_PER_ELEMENT)
}

/**
 * @private
 * @param {[[*]]} array 2 dimensional array with any values.
 * @returns {[*]} Flattend array.
 * @see https://jsperf.com/flatten-an-array-loop-vs-reduce/2
 */
export function flatten2D(array) {
  const flat = []

  for (let i = 0; i < array.length; i++) {
    let current = array[i]

    for (let j = 0; j < current.length; j++) {
      flat.push(current[j])
    }
  }

  return flat
}

/**
 * @private
 * @param {[[*]]} array 2 dimensional array with any values.
 * @returns {[[*]]} Transposed array
 * @see https://jsperf.com/transpose-2d-array
 */
export function transpose2D(array) {
  return array[0].map((col, i) => array.map(row => row[i]))
}

/**
 * @private
 * @param {[*]} array Array with any values.
 * @param {number} width The width of the grid.
 * @returns {[[*]]} Grid
 */
export function grid2D(array, width) {
  if (array.length % width !== 0) {
    throw 'array length is not dividable by the provided width'
  }

  const grid = []
  const columns = array.length / width

  for (let i = 0; i < columns; i++) {
    grid.push(array.slice(i * width, (i + 1) * width))
  }

  return grid
}

/**
 * Get the appropreate function from the C++ bindings based on name and type.
 *
 * @private
 * @param {...string} functionIds Name of the function to get from the exports without the type pre or suffix.
 * @returns {[function]} WASM exported functions in the same order as `funcNames`.
 * @example
 * const [constructor] = getExports('gdual_d', 'expression_constructor')
 */
export const getExports = (...functionIds) => {
  const { exports } = getInstance()

  const exportedFuncs = functionIds.map(funcId => {
    const exportedFunc = exports[funcId]

    if (!exportedFunc) {
      throw `${funcId} is not an exported function.`
    }

    return exportedFunc
  })

  return exportedFuncs
}

/**
 * Get the appropreate function from the C++ bindings based on name and type.
 *
 * @private
 * @description This will only work if a consistend naming scheme is being used to name the C++ binding functions
 * @example
 * _expression_constructor
 * _expression_constructor_gdual_d
 * _expression_constructor_gdual_v
 * @param {string} className Name of the class to get exports for.
 * @param {('double'|'gdual_d'|'gdual_v')} type
 * @param {...string} funcNames Name of the function to get from the exports without the type pre or suffix.
 * @returns {[function]} WASM exported functions in the same order as `funcNames`.
 * @example
 * const [constructor, evaluate] = getExportsFactory('expression', 'gdual_d', 'constructor', 'evaluate')
 * @example
 * const getExports = getExportsFactory.bind(null, 'expression', 'gdual_d')
 * const [constructor, evaluate] = getExports('constructor', 'evaluate')
 */
export const getExportsFactory = (className, type, ...funcNames) => {
  if (DCGP_TYPES.indexOf(type) === -1) {
    throw `Type '${type}' is invalid. Must be one of ${DCGP_TYPES}`
  }

  let suffix = ''
  if (type !== 'double') {
    suffix += '_' + type
  }

  const funcIds = funcNames.map(funcName => {
    const lowerCaseClassName = className.toLowerCase()
    const funcId = '_' + lowerCaseClassName + '_' + funcName + suffix
    return funcId
  })

  return getExports(...funcIds)
}
