#include <emscripten.h>
#include <dcgp/expression.hpp>
#include <dcgp/expression_weighted.hpp>
#include <audi/gdual.hpp>
#include <audi/vectorized.hpp>

using namespace dcgp;

typedef audi::gdual<double> gdual_d;
typedef audi::gdual<audi::vectorized<double>> gdual_v;

extern "C"
{
  void EMSCRIPTEN_KEEPALIVE expression_destroy(
      const expression<double> *const self)
  {
    delete self;
  }

  void EMSCRIPTEN_KEEPALIVE expression_destroy_gdual_d(
      const expression<gdual_d> *const self)
  {
    delete self;
  }

  void EMSCRIPTEN_KEEPALIVE expression_destroy_gdual_v(
      const expression<gdual_v> *const self)
  {
    delete self;
  }

  void EMSCRIPTEN_KEEPALIVE expression_weighted_destroy(
      const expression_weighted<double> *const self)
  {
    delete self;
  }

  void EMSCRIPTEN_KEEPALIVE expression_weighted_destroy_gdual_d(
      const expression_weighted<gdual_d> *const self)
  {
    delete self;
  }

  void EMSCRIPTEN_KEEPALIVE expression_weighted_destroy_gdual_v(
      const expression_weighted<gdual_v> *const self)
  {
    delete self;
  }
}
