import { setInHEAP } from './helpers';

export default function ExpressionInitializer(dcgp) {
  const {
    // HEAPU8,
    // HEAPU16,
    HEAPU32,
    // HEAPF64,
    stackSave,
    stackAlloc,
    stackRestore,
    _embind_delete_uint32_array,
    _embind_expression_0,
    _embind_expression_get,
    _embind_expression_set,
    _embind_expression_destroy,
  } = dcgp;

  return class Expression {
    constructor(
      inputs,
      outputs,
      rows,
      columns,
      levelsBack,
      arity,
      kernelSet,
      seed = Math.random
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

      Object.defineProperty(this, 'pointer', { value: pointer });
      Object.defineProperty(this, 'inputs', { value: inputs });
      Object.defineProperty(this, 'outputs', { value: outputs });
      Object.defineProperty(this, 'rows', { value: rows });
      Object.defineProperty(this, 'columns', { value: columns });
      Object.defineProperty(this, 'levelsBack', { value: levelsBack });
      Object.defineProperty(this, 'arity', { value: arity });
      Object.defineProperty(this, 'seed', { value: calculatedSeed });
    }

    getChromosome() {
      const stackStart = stackSave();

      const lengthPointer = stackAlloc(Uint32Array.BYTES_PER_ELEMENT);

      const arrayPointer = _embind_expression_get(this.pointer, lengthPointer);

      const chromosome = new Uint32Array(
        HEAPU32.buffer,
        arrayPointer,
        HEAPU32[lengthPointer / HEAPU32.BYTES_PER_ELEMENT]
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

      setInHEAP(HEAPU32, intChromosome, chromosomePointer);

      _embind_expression_set(
        this.pointer,
        chromosomePointer,
        intChromosome.length
      );

      stackRestore(stackStart);
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
