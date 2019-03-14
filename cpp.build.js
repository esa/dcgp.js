/* eslint-env node */
/* eslint-disable no-console */
const execa = require('execa');
const glob = require('glob');

glob('src/cpp/**/*.cpp', null, async (error, files) => {
  if (error) {
    throw new Error(error);
  }

  const cwd = process.cwd();

  let args = [
    '-o',
    'dcgp.js',
    `-I${cwd}/dcgp/include/`,
    `-I${cwd}/audi/include/`,
    '-std=c++11',
    '-g4',
    '--source-map-base',
    'http://localhost:8080/',
    '-O3',
    '--pre-js',
    `${cwd}/src/js/pre.js`,
  ];

  args = files.concat(args);

  try {
    const { stdout, stderr } = await execa('emcc', args);

    if (stderr) {
      console.error(stderr);
    }

    console.log(stdout);
  } catch (error) {
    throw error;
  }
});
