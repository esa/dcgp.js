const fs = require('fs')
const path = require('path')
import { initialise, getInstance } from '../initialiser'
import muPlusLambda from '../algorithms/mu-plus-lambda'
import KernelSet from '../classes/KernelSet'
import Expression from '../classes/Expression'

describe('mu plus lambda', () => {
  let stackStart

  beforeAll(async () => {
    const dcgpBuffer = fs.readFileSync(path.resolve('dcgp.wasm')).buffer
    await initialise(dcgpBuffer)
    const { stackSave } = getInstance().exports

    stackStart = stackSave()
  })

  afterEach(() => {
    const { stackRestore } = getInstance().exports

    stackRestore(stackStart)
  })

  it('recovers from NaN', () => {
    const inputs = [[0, 1, 1000]]
    const outputs = [[1000, 1, 0]]

    const myKernelSet = new KernelSet(...KernelSet.ALL_KERNELS)
    const myExpression = new Expression(2, 1, 1, 20, 5, 2, myKernelSet, 2)

    myExpression.chromosome = JSON.parse(
      '[3,0,0,2,1,2,1,1,2,5,2,2,6,2,4,7,3,2,2,3,6,8,6,8,8,7,6,6,8,7,8,8,9,6,8,10,1,10,12,1,10,14,6,14,13,8,16,12,8,15,16,3,18,14,3,18,16,0,18,18,17]'
    )

    const constants = [1]

    const lossBefore = myExpression.loss(inputs, outputs, constants)
    expect(isFinite(lossBefore)).toBeFalsy()

    const result = muPlusLambda(
      myExpression,
      1,
      4,
      100,
      inputs,
      outputs,
      constants
    )

    expect(isFinite(result.loss)).toBeTruthy()
  })

  it('recovers from Infinity', () => {
    const inputs = [[0, 1, 1000]]
    const outputs = [[1000, 1, 0]]

    const myKernelSet = new KernelSet(...KernelSet.ALL_KERNELS)
    const myExpression = new Expression(1, 1, 1, 20, 5, 2, myKernelSet, 850)

    myExpression.chromosome = JSON.parse(
      '[7,0,0,6,0,1,4,0,1,3,1,0,7,2,0,6,3,4,3,2,2,0,7,6,0,8,4,7,9,5,1,8,8,1,8,9,7,8,9,5,10,12,8,14,13,4,15,12,0,13,12,6,16,17,7,15,14,7,15,17,17]'
    )

    const lossBefore = myExpression.loss(inputs, outputs)
    expect(isFinite(lossBefore)).toBeFalsy()

    const result = muPlusLambda(myExpression, 1, 4, 100, inputs, outputs)

    expect(isFinite(result.loss)).toBeTruthy()
  })
})
