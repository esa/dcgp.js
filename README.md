<h3 align="center">
  <img src="https://user-images.githubusercontent.com/26207957/53115725-3898d100-3547-11e9-8b6f-2666d16ef559.png" width="400px" />
</h3>

# dcgp.js
JavaScript bindings for the [differential Cartesian Genetic Programming library](https://github.com/darioizzo/dcgp). The goal of this project is to provide a library that can run dcgp both on node.js and the web.

## Installation

Install dcgp.js with npm:

```bash
npm install dcgp
```

### Usage
```js
import { createInstance } from 'dcgp'

const dcgp = await createInstance(fetch('/dcgp.wasm') /* or ArrayBuffer or WebAssembly.Module */);
const myKernelSet = new dcgp.KernelSet(['sum', 'diff', 'mul', 'pdiv']);
const myExpression = new dcgp.Expression(2, 1, 2, 6, 5, 2, myKernelSet, 5);

// some simple dataset: y = 2x + 2
const inputs = [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1]];
const outputs = [[2], [4], [6], [8], [10]];

const resultObj = dcgp.algorithms.onePlusLambda(myExpression, 5, 50, inputs, outputs);

// Free WebAssembly memory
myKernelSet.destroy()
myExpression.destroy()
```

# Development
Anyone is welcome to help progress and improve this library. Tasks can be found in the [dcgp.js project](https://github.com/mikeheddes/dcgp.js/projects/1). If your problem/task is not in the tasks, feel free to create a new issue explaining your problem/task.

## Prerequisite
- `node.js` >= 8
- `npm`
- Docker

## Installation

**Note:** the instructions shown below assume Linux or macOS. Comments are provided with instructions for Windows.

```bash
git clone https://github.com/mikeheddes/dcgp.js.git

# Commands to install emscripten
# For Windows see the notes: https://emscripten.org/docs/getting_started/downloads.html
./emsdk/emsdk install latest
./emsdk/emsdk activate latest

npm install

npm run build
```
