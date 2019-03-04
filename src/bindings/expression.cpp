// #include <emscripten.h>
// // #include <vector>
// // #include <iostream>
// // #include <string>

// #include "dcgp/expression.hpp"
// #include "dcgp/kernel_set.hpp"


// using namespace dcgp;

// extern "C"
// {
//   // empty constructor
//   expression<double> *EMSCRIPTEN_KEEPALIVE embind_expression_0(const unsigned int inputs, const unsigned int outputs, const unsigned int rows, const unsigned int columns, const unsigned int levels_back, const unsigned int arity, const kernel_set<double> * const kernels, const double seed)
//   {
//     return new expression<double>(inputs, outputs, rows, columns, levels_back, arity, (*kernels)(), seed);
//   }
  
//   // destroy
//   void EMSCRIPTEN_KEEPALIVE embind_expression_destroy(const expression<double> *const self)
//   {
//     delete self;
//   }
// }
