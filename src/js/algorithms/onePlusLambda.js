import { setInHEAP, flatten } from '../helpers'

export default function onePlusLambdaInitialiser({ memory, exports }) {
  const { F64 } = memory
  const {
    stackSave,
    stackAlloc,
    stackRestore,
    _embind_one_plus_lambda,
  } = exports

  return function onePlusLambda(
    expression,
    offsprings,
    maxGen,
    inputs,
    outputs
  ) {
    if (inputs.length !== outputs.length) {
      throw new Error(
        'input and output must be an array of the same length. ' +
          `Lengths ${inputs.length} and ${outputs.length} found.`
      )
    }

    const stackStart = stackSave()

    const data = {
      inputs: {
        raw: inputs,
      },
      outputs: {
        raw: outputs,
      },
    }

    Object.keys(data).forEach(key => {
      const flat = flatten(data[key].raw)

      const flatDouble = new Float64Array(flat)

      const pointer = stackAlloc(flatDouble.byteLength)

      setInHEAP(F64, flatDouble, pointer)

      data[key].pointer = pointer
    })

    const loss = _embind_one_plus_lambda(
      expression.pointer,
      offsprings,
      maxGen,
      data.inputs.pointer,
      data.outputs.pointer,
      inputs.length
    )
    const chromosome = expression.getChromosome()

    stackRestore(stackStart)
    return {
      loss,
      chromosome,
    }
  }
}
