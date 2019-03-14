import { setInHEAP, decoder, encodeStringArray } from './helpers';

function randomSeed() {
  return Math.round(Math.random() * 10000);
}

export default function ExpressionInitialiser({ memory, exports }) {
  const { U8, U32, F64 } = memory;
  const {
    stackSave,
    stackAlloc,
    stackRestore,
    _embind_delete_uint32_array,
    _embind_expression_0,
    _embind_expression_get,
    _embind_expression_set,
    _embind_expression_call_double,
    _embind_expression_call_string,
    _embind_expression_destroy,
    _embind_delete_double_array,
    _embind_delete_string,
  } = exports;

  return class Expression {
    constructor(
      inputs,
      outputs,
      rows,
      columns,
      levelsBack,
      arity,
      kernelSet,
      seed = randomSeed
    ) {
      const calculatedSeed = typeof seed === 'function' ? seed() : seed;

      const pointer = _embind_expression_0(
        inputs,
        outputs,
        rows,
        columns,
        levelsBack,
        arity,
        kernelSet.pointer,
        calculatedSeed
      );

      Object.defineProperties(this, {
        pointer: { value: pointer },
        inputs: { value: inputs },
        outputs: { value: outputs },
        rows: { value: rows },
        columns: { value: columns },
        levelsBack: { value: levelsBack },
        arity: { value: arity },
        seed: { value: calculatedSeed },
      });
    }

    getChromosome() {
      const stackStart = stackSave();

      const lengthPointer = stackAlloc(Uint32Array.BYTES_PER_ELEMENT);

      const arrayPointer = _embind_expression_get(this.pointer, lengthPointer);

      const chromosome = new Uint32Array(
        U32.buffer,
        arrayPointer,
        U32[lengthPointer / U32.BYTES_PER_ELEMENT]
      );

      _embind_delete_uint32_array(arrayPointer);

      stackRestore(stackStart);
      return Array.from(chromosome);
    }

    setChromosome(chromosome) {
      const stackStart = stackSave();

      if (!Array.isArray(chromosome)) {
        throw 'chromosome is not an array';
      }

      if (!chromosome.every(i => typeof i === 'number')) {
        throw 'Every entry of chromosome must be a number';
      }

      if (!chromosome.every(i => i >= 0)) {
        throw 'Every entry of chromosome must not be negative';
      }

      const intChromosome = new Uint32Array(chromosome);
      const chromosomePointer = stackAlloc(intChromosome.byteLength);

      setInHEAP(U32, intChromosome, chromosomePointer);

      _embind_expression_set(
        this.pointer,
        chromosomePointer,
        intChromosome.length
      );

      stackRestore(stackStart);
    }

    getResult(inputArray) {
      if (!Array.isArray(inputArray)) {
        throw 'inputArray is not an array';
      }

      if (!inputArray.every(i => typeof i === 'number')) {
        throw 'Every entry of inputArray must be a number';
      }

      const stackStart = stackSave();

      const inputArrayF64 = new Float64Array(inputArray);
      const inputPointer = stackAlloc(inputArrayF64.byteLength);
      setInHEAP(F64, inputArrayF64, inputPointer);

      const resultLengthPointer = stackAlloc(Uint32Array.BYTES_PER_ELEMENT);

      const resultPointer = _embind_expression_call_double(
        this.pointer,
        inputPointer,
        inputArray.length,
        resultLengthPointer
      );

      const resultLength =
        U32[resultLengthPointer / Uint32Array.BYTES_PER_ELEMENT];

      const results = new Float64Array(F64.buffer, resultPointer, resultLength);

      _embind_delete_double_array(resultPointer);
      stackRestore(stackStart);

      return Array.from(results);
    }

    getEquation(inputArray) {
      if (!Array.isArray(inputArray)) {
        throw 'inputArray is not an array';
      }

      if (!inputArray.every(i => typeof i === 'string')) {
        throw 'Every entry of inputArray must be a string';
      }

      const stackStart = stackSave();

      const encoded = encodeStringArray(inputArray);

      const stringsPointer = stackAlloc(encoded.strings.byteLength);
      setInHEAP(U8, encoded.strings, stringsPointer);

      const lengthsPointer = stackAlloc(encoded.lengths.byteLength);
      setInHEAP(U32, encoded.lengths, lengthsPointer);

      const resultLengthPointer = stackAlloc(Uint16Array.BYTES_PER_ELEMENT);

      const resultPointer = _embind_expression_call_string(
        this.pointer,
        stringsPointer,
        lengthsPointer,
        inputArray.length,
        resultLengthPointer
      );

      const resultLength =
        U32[resultLengthPointer / Uint32Array.BYTES_PER_ELEMENT];
      const resultIntArray = new Uint8Array(
        U8.buffer,
        resultPointer,
        resultLength
      );

      const result = decoder.decode(resultIntArray);

      _embind_delete_string(resultPointer);
      stackRestore(stackStart);

      return result;
    }

    // // Gets the idx of the active genes in the current chromosome(numbering is from 0)
    // getActiveGenes() {}

    // // Gets the idx of the active nodes in the current chromosome
    // getActiveNodes() {}

    // // Gets the kernel functions
    // getKernels() {}

    // // Gets a vector containing the indexes in the chromosome where each node starts to be expressed.
    // getGeneIdx() {}

    // // Gets the lower bounds of the chromosome
    // getLowerBounds() {}

    // // Gets the upper bounds of the chromosome
    // getUpperBounds() {}

    // // Computes the loss of the model on the data
    // // The loss must be one of “MSE” for Mean Square Error and “CE” for Cross Entropy.
    // loss(points, labels, loss_type = 'MSE') {}

    // // Mutates multiple genes within their allowed bounds.
    // mutate(indexes) {}

    // // Mutates N randomly selected active genes within their allowed bounds
    // mutateActive(N = 1) {}

    // // Mutates N randomly selected active connections within their allowed bounds
    // mutateActiveConnections(N = 1) {}

    // // Mutates N randomly selected active function genes within their allowed bounds
    // mutateActiveFunctions(N = 1) {}

    // // Mutates N randomly selected output genes connection within their allowed bounds
    // mutateOutputs(N = 1) {}

    // // Mutates N randomly selected genes within its allowed bounds
    // mutateRandom(N = 1) {}

    // // Sets for a valid node(i.e.not an input node) a new kernel.
    // setFunction(nodeIndexes, kernelIds) {}

    destroy() {
      _embind_expression_destroy(this.pointer);
    }
  };
}
