const fs = require('fs');
const path = require('path');
import { createInstance } from '../';

let dcgpBuffer;
const inputs = [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1]];
const outputs = [[2], [4], [6], [8], [10]];

beforeAll(async () => {
  dcgpBuffer = fs.readFileSync(path.resolve('dcgp.wasm')).buffer;
});

it('instantiates without error', async () => {
  const dcgp = await createInstance(dcgpBuffer);
  const myKernelSet = new dcgp.KernelSet(['sum', 'diff', 'mul', 'pdiv']);
  const myExpression = new dcgp.Expression(2, 1, 2, 6, 5, 2, myKernelSet, 5);
  dcgp.algorithms.onePlusLambda(myExpression, 5, 50, inputs, outputs);
});
