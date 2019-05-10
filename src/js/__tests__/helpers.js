import { initialise, getInstance } from '../initialiser'
import {
  encodeStrings,
  decodeStrings,
  stackPutArray,
  flatten2D,
  transpose2D,
  grid2D,
  containsOneType,
  containsNumbersOnly,
  isNumber,
  isString,
  isArray,
} from '../helpers'

describe('helpers', () => {
  let stackStart

  beforeAll(async () => {
    await initialise()
    const { stackSave } = getInstance().exports

    stackStart = stackSave()
  })

  afterEach(() => {
    const { stackRestore } = getInstance().exports

    stackRestore(stackStart)
  })

  describe('encodeStrings', () => {
    it('appends a NULL char', () => {
      const str = 'test'
      const encodedStr = encodeStrings(str)

      expect(encodedStr).toHaveLength(str.length + 1)
      expect(encodedStr[encodedStr.length - 1]).toBe(0)
    })

    it('joins strings with a NULL char', () => {
      const strings = ['test', '1', 'two']
      const encodedStrings = encodeStrings(...strings)

      const totalLength =
        strings.reduce((prev, cur) => prev + cur.length, 0) + strings.length

      expect(encodedStrings).toHaveLength(totalLength)

      let currentIndex = 0
      strings.forEach(str => {
        currentIndex += str.length
        expect(encodedStrings[currentIndex]).toBe(0)
        currentIndex++
      })
    })

    it('returns a Uint8Array', () => {
      const strings = ['test', '1', 'two']
      const encodedStrings = encodeStrings(...strings)

      // toBeInstance of work around: https://github.com/facebook/jest/issues/7780
      expect(encodedStrings.constructor.name).toBe('Uint8Array')
    })
  })

  describe('decodeStrings', () => {
    it('decodes strings separeted by a NULL char', () => {
      // start set text array in memory
      const strings = ['test', '1', 'two']
      const encodedStrings = encodeStrings(...strings)

      // toBeInstance of work around: https://github.com/facebook/jest/issues/7780
      expect(encodedStrings.constructor.name).toBe('Uint8Array')

      const { U8 } = getInstance().memory
      const pointer = stackPutArray(encodedStrings, U8)
      // end set text array in memory

      // start decode text array
      const decodedStrings = decodeStrings(pointer, strings.length)
      decodedStrings.forEach((decodedString, i) => {
        expect(decodedString).toBe(strings[i])
      })
      // end decode text array
    })
  })

  describe('flatten2D', () => {
    it('flattens a 2D array', () => {
      const matrix = [[1, 2, 3], [4, 5, 6]]

      const flat = flatten2D(matrix)
      const expectedArray = [1, 2, 3, 4, 5, 6]

      flat.forEach((val, i) => {
        expect(val).toBe(expectedArray[i])
      })
    })
  })

  describe('transpose2D', () => {
    it('transposes a 2D array', () => {
      const matrix = [[1, 2, 3], [4, 5, 6]]

      const flat = transpose2D(matrix)
      const expectedArray = [[1, 4], [2, 5], [3, 6]]

      flat.forEach((row, i) => {
        row.forEach((val, j) => {
          expect(val).toBe(expectedArray[i][j])
        })
      })
    })
  })

  describe('grid2D', () => {
    it('creats a 2D grid array', () => {
      const array = [1, 2, 3, 4, 5, 6]

      const grid = grid2D(array, 3)
      const expectedArray = [[1, 2, 3], [4, 5, 6]]

      grid.forEach((row, i) => {
        row.forEach((val, j) => {
          expect(val).toBe(expectedArray[i][j])
        })
      })
    })
  })

  describe('type checking', () => {
    describe('isNumber', () => {
      it('returns true when providing a number', () => {
        expect(isNumber(0)).toBeTruthy()
        expect(isNumber(Number.MAX_SAFE_INTEGER)).toBeTruthy()
        expect(isNumber(Number.MIN_SAFE_INTEGER)).toBeTruthy()
        expect(isNumber(Number.MAX_VALUE)).toBeTruthy()
        expect(isNumber(Number.MIN_VALUE)).toBeTruthy()
      })

      it('returns false when providing not a number', () => {
        expect(isNumber('4')).toBeFalsy()
        expect(isNumber(true)).toBeFalsy()
        expect(isNumber([4])).toBeFalsy()
      })
    })

    describe('isString', () => {
      it('returns true when providing a string', () => {
        expect(isString('test')).toBeTruthy()
        expect(isString('string\\\0with unusual" \'characters')).toBeTruthy()
      })

      it('returns false when providing not a string', () => {
        expect(isString(4)).toBeFalsy()
        expect(isString(true)).toBeFalsy()
        expect(isString(['string'])).toBeFalsy()
      })
    })

    describe('isArray', () => {
      it('returns true when providing a array', () => {
        expect(isArray([1, '2', true, { x: 5 }])).toBeTruthy()
      })

      it('returns false when providing not an array', () => {
        expect(isArray(4)).toBeFalsy()
        expect(isArray(true)).toBeFalsy()
        expect(isArray('string')).toBeFalsy()
      })
    })
  })

  describe('containsOneType', () => {
    it('returns true when providing an array containing one type', () => {
      const numbersArray = [1, 2, 3, 4, 5, 6]
      expect(containsOneType(numbersArray)).toBeTruthy()

      const stringArray = ['1', '2', '3', '4', '5', '6']
      expect(containsOneType(stringArray)).toBeTruthy()

      const booleanArray = [true, false, true, true]
      expect(containsOneType(booleanArray)).toBeTruthy()
    })

    it('returns false when providing an array containing mulitiple types', () => {
      const numbersArray = [1, '2', 3, 4, 5, 6]
      expect(containsOneType(numbersArray)).toBeFalsy()

      const stringArray = ['1', '2', '3', '4', 5, '6']
      expect(containsOneType(stringArray)).toBeFalsy()

      const booleanArray = [true, false, 'true', 1]
      expect(containsOneType(booleanArray)).toBeFalsy()
    })
  })

  describe('containsNumbersOnly', () => {
    it('returns true when providing an array containing numbers only', () => {
      const numbersArray = [1, 2, 3, 4, 5, 6]
      expect(containsNumbersOnly(numbersArray)).toBeTruthy()
    })

    it('returns true when providing a matrix containing numbers only', () => {
      const matrix = [[1, 2, 3], [4, 5, 6]]
      expect(containsNumbersOnly(matrix)).toBeTruthy()
    })

    it('returns false when providing an array containing not a number', () => {
      const numbersArray = [1, '2', 3, 4, 5, 6]
      expect(containsNumbersOnly(numbersArray)).toBeFalsy()
    })

    it('returns false when providing a matrix containing not a number', () => {
      const matrix = [[1, '2', 3], [4, 5, 6]]
      expect(containsNumbersOnly(matrix)).toBeFalsy()
    })
  })
})
