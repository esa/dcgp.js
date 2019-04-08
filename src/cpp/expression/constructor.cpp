#include <emscripten.h>
#include <dcgp/expression.hpp>
#include <dcgp/expression_weighted.hpp>
#include <dcgp/kernel_set.hpp>
#include <audi/gdual.hpp>
#include <audi/vectorized.hpp>

using namespace dcgp;

typedef audi::gdual<double> gdual_d;
typedef audi::gdual<audi::vectorized<double>> gdual_v;

extern "C"
{
  expression<double> *EMSCRIPTEN_KEEPALIVE expression_constructor(
      const unsigned inputs,
      const unsigned outputs,
      const unsigned rows,
      const unsigned columns,
      const unsigned levels_back,
      const unsigned arity,
      const kernel_set<double> *const kernels,
      const double seed)
  {
    return new expression<double>(
        inputs,
        outputs,
        rows,
        columns,
        levels_back,
        arity,
        (*kernels)(),
        seed);
  }

  expression<gdual_d> *EMSCRIPTEN_KEEPALIVE expression_constructor_gdual_d(
      const unsigned inputs,
      const unsigned outputs,
      const unsigned rows,
      const unsigned columns,
      const unsigned levels_back,
      const unsigned arity,
      const kernel_set<gdual_d> *const kernels,
      const double seed)
  {
    return new expression<gdual_d>(
        inputs,
        outputs,
        rows,
        columns,
        levels_back,
        arity,
        (*kernels)(),
        seed);
  }

  expression<gdual_v> *EMSCRIPTEN_KEEPALIVE expression_constructor_gdual_v(
      const unsigned inputs,
      const unsigned outputs,
      const unsigned rows,
      const unsigned columns,
      const unsigned levels_back,
      const unsigned arity,
      const kernel_set<gdual_v> *const kernels,
      const double seed)
  {
    return new expression<gdual_v>(
        inputs,
        outputs,
        rows,
        columns,
        levels_back,
        arity,
        (*kernels)(),
        seed);
  }

  expression_weighted<double> *EMSCRIPTEN_KEEPALIVE expression_weighted_constructor(
      const unsigned inputs,
      const unsigned outputs,
      const unsigned rows,
      const unsigned columns,
      const unsigned levels_back,
      const unsigned arity,
      const kernel_set<double> *const kernels,
      const double seed)
  {
    return new expression_weighted<double>(
        inputs,
        outputs,
        rows,
        columns,
        levels_back,
        arity,
        (*kernels)(),
        seed);
  }

  expression_weighted<gdual_d> *EMSCRIPTEN_KEEPALIVE expression_weighted_constructor_gdual_d(
      const unsigned inputs,
      const unsigned outputs,
      const unsigned rows,
      const unsigned columns,
      const unsigned levels_back,
      const unsigned arity,
      const kernel_set<gdual_d> *const kernels,
      const double seed)
  {
    return new expression_weighted<gdual_d>(
        inputs,
        outputs,
        rows,
        columns,
        levels_back,
        arity,
        (*kernels)(),
        seed);
  }

  expression_weighted<gdual_v> *EMSCRIPTEN_KEEPALIVE expression_weighted_constructor_gdual_v(
      const unsigned inputs,
      const unsigned outputs,
      const unsigned rows,
      const unsigned columns,
      const unsigned levels_back,
      const unsigned arity,
      const kernel_set<gdual_v> *const kernels,
      const double seed)
  {
    return new expression_weighted<gdual_v>(
        inputs,
        outputs,
        rows,
        columns,
        levels_back,
        arity,
        (*kernels)(),
        seed);
  }
}
