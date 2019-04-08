#include <emscripten.h>
#include <dcgp/kernel_set.hpp>
#include <audi/gdual.hpp>
#include <audi/vectorized.hpp>

using namespace dcgp;

typedef audi::gdual<double> gdual_d;
typedef audi::gdual<audi::vectorized<double>> gdual_v;

extern "C"
{
  void EMSCRIPTEN_KEEPALIVE kernel_set_clear(kernel_set<double> *const self)
  {
    self->clear();
  }

  void EMSCRIPTEN_KEEPALIVE kernel_set_clear_gdual_d(kernel_set<gdual_d> *const self)
  {
    self->clear();
  }

  void EMSCRIPTEN_KEEPALIVE kernel_set_clear_gdual_v(kernel_set<gdual_v> *const self)
  {
    self->clear();
  }
}

