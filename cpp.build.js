/* eslint-env node */
/* eslint-disable no-console */
const execa = require('execa');
const glob = require('glob');

glob('src/cpp/**/*.cpp', null, (error, files) => {
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

  execa('emcc', args)
    .then(({ stdout, stderr }) => {
      if (stderr) {
        console.error(stderr);
      }

      console.log(stdout);
    })
    .catch(error => {
      throw error;
    });
});
