#include <emscripten.h>
#include <dcgp/kernel_set.hpp>
#include <audi/gdual.hpp>
#include <audi/vectorized.hpp>

using namespace dcgp;

typedef audi::gdual<double> gdual_d;
typedef audi::gdual<audi::vectorized<double>> gdual_v;

extern "C"
{
  void EMSCRIPTEN_KEEPALIVE kernel_set_destroy(const kernel_set<double> *const self)
  {
    delete self;
  }

  void EMSCRIPTEN_KEEPALIVE kernel_set_destroy_gdual_d(const kernel_set<gdual_d> *const self)
  {
    delete self;
  }

  void EMSCRIPTEN_KEEPALIVE kernel_set_destroy_gdual_v(const kernel_set<gdual_v> *const self)
  {
    delete self;
  }
}

