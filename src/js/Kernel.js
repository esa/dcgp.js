import { setInHEAP, encodeStringArray, decoder } from './helpers'

export default function KernelInitialiser({ memory, exports }) {
  const { U8, U32, F64 } = memory
  const {
    stackSave,
    stackAlloc,
    stackRestore,
    _embind_kernel_name,
    _embind_delete_string,
    _embind_kernel_call_double,
    _embind_kernel_call_string,
    _embind_kernel_destroy,
  } = exports

  return class Kernel {
    constructor(operatorFunction, stringFunction, name, pointer = null) {
      const stackStart = stackSave()

      if (pointer) {
        Object.defineProperty(this, 'pointer', { value: pointer })

        const lengthPointer = stackAlloc(Uint32Array.BYTES_PER_ELEMENT)

        const namePointer = _embind_kernel_name(this.pointer, lengthPointer)

        const nameLength = U32[lengthPointer / Uint32Array.BYTES_PER_ELEMENT]

        const nameArray = new Uint8Array(U8.buffer, namePointer, nameLength)

        const retrievedName = decoder.decode(nameArray)
        Object.defineProperty(this, 'name', { value: retrievedName })

        _embind_delete_string(namePointer)

        stackRestore(stackStart)
        return
      }

      // When compiling with optimizations (e.g. -O3) this functionality breaks.
      // Without comiler optimalizations (-O0) the commented out code works and
      // can be used to creat a kernel with a custom JS function.
      throw new Error(
        'Initializing a kernel with JavaScript functions is not supported.'
      )

      // const wrappedOperationFunc = (arrayPointer, length) => {
      //   const inputArray = new Float64Array(HEAPF64.buffer, arrayPointer, length);

      //   return operatorFunction(inputArray);
      // };

      // const wrappedStringFunc = (arrayPointer, lengthsPointer, length, outputPointer) => {
      //   const lengthsArray = new Uint16Array(
      //     HEAPU16.buffer,
      //     lengthsPointer,
      //     length
      //   );

      //   const inputArray = new Array(length);
      //   let shifted = 0;

      //   for (let index = 0; index < length; index++) {
      //     const textIntArray = new Uint8Array(
      //       HEAPU8.buffer,
      //       shifted + arrayPointer,
      //       lengthsArray[index]
      //     );

      //     inputArray[index] = decoder.decode(textIntArray);
      //     shifted += lengthsArray[index];
      //   }

      //   const result = stringFunction(inputArray);
      //   const resultIntArray = encoder.encode(result + '\0');
      //   setInHEAP(HEAPU8, resultIntArray, outputPointer);
      // };

      // // This can cause an error based on the RESERVED_FUNCTION_POINTERS compile setting
      // const operationPointer = addFunction(wrappedOperationFunc);
      // const printPointer = addFunction(wrappedStringFunc);

      // Object.defineProperty(this, "functionPointers", {
      //   value: [operationPointer, printPointer]
      // });

      // const nameIntArray = encoder.encode(name + '\0');
      // const namePointer = stackAlloc(nameIntArray.byteLength);
      // setInHEAP(HEAPU8, nameIntArray, namePointer);

      // const receivedPointer = _embind_kernel_0(
      //   operationPointer,
      //   printPointer,
      //   namePointer,
      //   nameIntArray.length
      // );

      // Object.defineProperty(this, "pointer", { value: receivedPointer });
      // Object.defineProperty(this, "name", { value: name });

      // stackRestore(stackStart);
    }

    getResult(inputArray) {
      if (!Array.isArray(inputArray)) {
        throw 'inputArray is not an array'
      }

      if (!inputArray.every(i => typeof i === 'number')) {
        throw 'Every entry of inputArray must be a number'
      }

      const stackStart = stackSave()

      const inputArrayF64 = new Float64Array(inputArray)
      const inputPointer = stackAlloc(inputArrayF64.byteLength)
      setInHEAP(F64, inputArrayF64, inputPointer)

      const result = _embind_kernel_call_double(
        this.pointer,
        inputPointer,
        inputArray.length
      )

      stackRestore(stackStart)

      return result
    }

    getEquation(inputArray) {
      if (!Array.isArray(inputArray)) {
        throw 'inputArray is not an array'
      }

      if (!inputArray.every(i => typeof i === 'string')) {
        throw 'Every entry of inputArray must be a string'
      }

      const stackStart = stackSave()

      const encoded = encodeStringArray(inputArray)

      const stringsPointer = stackAlloc(encoded.strings.byteLength)
      setInHEAP(U8, encoded.strings, stringsPointer)

      const lengthsPointer = stackAlloc(encoded.lengths.byteLength)
      setInHEAP(U32, encoded.lengths, lengthsPointer)

      const resultLengthPointer = stackAlloc(Uint32Array.BYTES_PER_ELEMENT)

      const resultPointer = _embind_kernel_call_string(
        this.pointer,
        stringsPointer,
        lengthsPointer,
        inputArray.length,
        resultLengthPointer
      )

      const resultLength =
        U32[resultLengthPointer / Uint32Array.BYTES_PER_ELEMENT]
      const resultIntArray = new Uint8Array(
        U8.buffer,
        resultPointer,
        resultLength
      )
      const result = decoder.decode(resultIntArray)

      _embind_delete_string(resultPointer)
      stackRestore(stackStart)

      return result
    }

    toString() {
      return this.name
    }

    destroy() {
      // Use this to remove the custom functions if used.
      // See comment at constructor for more info.
      // if (this.functionPointers) {
      //   this.functionPointers.forEach(pointer => {
      //     removeFunction(pointer);
      //   });
      // }

      _embind_kernel_destroy(this.pointer)
    }
  }
}
