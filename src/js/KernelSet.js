import { setInHEAP, encodeStringArray, encoder } from './helpers';
import KernelInitializer from './Kernel';

const kernelNameOptions = {
  SUM: 'sum',
  DIFF: 'diff',
  MUL: 'mul',
  DIV: 'div',
  PDIV: 'pdiv',
  SIN: 'sin',
  COS: 'cos',
  LOG: 'log',
  EXP: 'exp',
};

export default function KernelSetInitialiser(instance) {
  const { memory, exports } = instance;
  const { U8, U32 } = memory;
  const {
    stackSave,
    stackAlloc,
    stackRestore,
    _embind_kernel_set_1,
    _embind_kernel_set_0,
    _embind_kernel_set_push_back_1,
    _embind_kernel_set_push_back_0,
    _embind_kernel_set_length,
    _embind_kernel_set_call,
    _embind_kernel_set_index,
    _embind_kernel_set_clean,
    _embind_kernel_set_destroy,
  } = exports;

  const Kernel = KernelInitializer(instance);

  return class KernelSet {
    static SUM = kernelNameOptions.SUM;
    static DIFF = kernelNameOptions.DIFF;
    static MUL = kernelNameOptions.MUL;
    static DIV = kernelNameOptions.DIV;
    static PDIV = kernelNameOptions.PDIV;
    static SIN = kernelNameOptions.SIN;
    static COS = kernelNameOptions.COS;
    static LOG = kernelNameOptions.LOG;
    static EXP = kernelNameOptions.EXP;

    static ALL_KERNELS = Object.values(kernelNameOptions);

    constructor(kernelNames, pointer = null) {
      if (pointer) {
        Object.defineProperty(this, 'pointer', { value: pointer });
        return;
      }

      if (kernelNames) {
        if (!Array.isArray(kernelNames)) {
          throw 'kernelNames is not an array';
        }

        if (!kernelNames.every(i => typeof i === 'string')) {
          throw 'Every entry of kernelNames must be a string';
        }

        const stackStart = stackSave();

        const encoded = encodeStringArray(kernelNames);

        const namesPointer = stackAlloc(encoded.strings.byteLength);
        setInHEAP(U8, encoded.strings, namesPointer);

        const lengthsPointer = stackAlloc(encoded.lengths.byteLength);
        setInHEAP(U32, encoded.lengths, lengthsPointer);

        const receivedPointer = _embind_kernel_set_1(
          namesPointer,
          lengthsPointer,
          kernelNames.length
        );

        Object.defineProperty(this, 'pointer', { value: receivedPointer });

        stackRestore(stackStart);
        return;
      }

      const receivedPointer = _embind_kernel_set_0();
      Object.defineProperty(this, 'pointer', { value: receivedPointer });
    }

    toString() {
      const kernels = this.getKernels();

      let stringResult = '';
      const lastIndex = kernels.length - 1;

      for (let index = 0; index < lastIndex; index++) {
        stringResult += kernels[index].toString();
        stringResult += ', ';
        kernels[index].destroy();
      }

      stringResult += kernels[lastIndex].toString();
      kernels[lastIndex].destroy();

      return stringResult;
    }

    // can add by kernelName or by Kernel object
    push(kernel) {
      if (kernel instanceof Kernel) {
        _embind_kernel_set_push_back_1(this.pointer, kernel.pointer);
        return;
      }

      if (typeof kernel !== 'string') {
        throw 'kernel must be a string';
      }

      const stackStart = stackSave();

      const textArray = encoder.encode(kernel);
      const textPointer = stackAlloc(textArray.byteLength);
      setInHEAP(U8, textArray, textPointer);

      _embind_kernel_set_push_back_0(this.pointer, textPointer, kernel.length);

      stackRestore(stackStart);
    }

    getKernels() {
      // TODO: make more efficient by combining length and call functions
      // use seperate function for delete from HEAP
      const stackStart = stackSave();

      const numKernels = _embind_kernel_set_length(this.pointer);
      const bytes = Uint32Array.BYTES_PER_ELEMENT * numKernels;
      const pointersArrPointer = stackAlloc(bytes);

      _embind_kernel_set_call(this.pointer, pointersArrPointer);

      const kernelPointers = new Uint32Array(
        U32.buffer,
        pointersArrPointer,
        numKernels
      );

      const kernels = new Array(numKernels);

      for (let index = 0; index < kernelPointers.length; index++) {
        kernels[index] = new Kernel(null, null, null, kernelPointers[index]);
      }

      stackRestore(stackStart);

      return kernels;
    }

    getKernel(index) {
      const pointer = _embind_kernel_set_index(this.pointer, index);

      return new Kernel(null, null, null, pointer);
    }

    clean() {
      _embind_kernel_set_clean(this.pointer);
    }

    destroy() {
      _embind_kernel_set_destroy(this.pointer);
    }
  };
}
