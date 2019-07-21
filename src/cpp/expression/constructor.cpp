#include <emscripten.h>
#include <dcgp/expression.hpp>
#include <dcgp/kernel_set.hpp>

#include "./expression.hpp"

using namespace dcgp;


extern "C"
{
  custom_expression<double> *EMSCRIPTEN_KEEPALIVE expression_constructor(
      const unsigned inputs,
      const unsigned outputs,
      const unsigned rows,
      const unsigned columns,
      const unsigned levels_back,
      const unsigned arity,
      const kernel_set<double> *const kernels,
      const double seed)
  {
    return new custom_expression<double>(
        inputs,
        outputs,
        rows,
        columns,
        levels_back,
        arity,
        kernels->operator()(),
        seed);
  }
}
