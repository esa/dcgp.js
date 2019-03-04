<h3 align="center">
  <img src="https://user-images.githubusercontent.com/26207957/53115725-3898d100-3547-11e9-8b6f-2666d16ef559.png" width="400px" />
</h3>

# dcgp.js
JavaScript bindings for the [differential Cartesian Genetic Programming library](https://github.com/darioizzo/dcgp).

## Prerequisite
- `node.js` >= 8
- `npm`
- MacOS or Linux

## Installation

```bash
git clone https://github.com/mikeheddes/dcgp.js.git

cd dcgp.js/emsdk

# Commands to install emscripten, see: https://emscripten.org/docs/getting_started/downloads.html
./emsdk install latest
./emsdk activate latest

# Activate PATH and other environment variables in the current terminal
source ./emsdk_env.sh

cd ..

npm install

npm run build:cpp
npm run build
```

## Assumptions
- This library asumes that the `dcgp.wasm` file is served from the same directory or from the root of the server.
- Assumes that WASM functions are not called before initialization has finished.

