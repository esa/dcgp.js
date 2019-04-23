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
import { initialise, KernelSet, Expression, algorithms } from 'dcgp'

await initialise(fetch('/dcgp.wasm') /* or ArrayBuffer or WebAssembly.Module */);
const myKernelSet = new KernelSet('sum', 'diff', 'mul', 'div');
const myExpression = new Expression(2, 1, 2, 6, 5, 2, myKernelSet, 5);

// some simple dataset: y = 2x + 2
const inputs = [[0, 1, 2, 3, 4]];
const outputs = [[2, 4, 6, 8, 10]];

const { loss } = algorithms.muPlusLambda(myExpression, 2, 5, 50, inputs, outputs, [1]);

// Free memory 
myKernelSet.destroy()
myExpression.destroy()
```

# Development
Anyone is welcome to help progress and improve this library. Tasks can be found in the [dcgp.js project](https://github.com/mikeheddes/dcgp.js/projects/1). If your problem/task is not in the tasks, feel free to create a new issue explaining your problem/task.

## Prerequisite
- docker

## Installation

**Note:** the instructions shown below assume Linux or macOS. Comments are provided with instructions for Windows.

```bash
git clone https://github.com/mikeheddes/dcgp.js.git

cd dcgp.js

# Start the 32bit ubuntu image with all dcgp.js' dependencies installed
# Note: make sure the docker daemon is running
docker run -it -v "$(pwd):/root/repo" -w /root/repo mikeheddes/dcgp.js-dependencies bash

# Command for windows
# docker run -it -v "%CD%:/root/repo" -w /root/repo mikeheddes/dcgp.js-dependencies bash

# A bash environment will open
npm install

npm run build

# To test the generated bundle in the browser run the following command
npx http-server lib

# To leave the bash environment run
exit

```

## VSCode IntelliSense support
To have IntelliSense support for the C++ files the include folder from the container needs to be copied to the local file system. For this you can use the following commands ones the docker images `mikeheddes/dcgp.js-dependencies` is running.

```bash
# Copy the container ID 
docker ps
docker cp REPLACE_WITH_THE_ID:/usr/local/include ./
docker cp REPLACE_WITH_THE_ID:/root/emsdk/emscripten/tag-1.38.30/system/include/ ./
docker cp REPLACE_WITH_THE_ID:/usr/include/eigen3 ./include/
```
