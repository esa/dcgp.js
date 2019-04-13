#include <emscripten.h>
#include <dcgp/kernel_set.hpp>

using namespace dcgp;

extern "C"
{
  void EMSCRIPTEN_KEEPALIVE kernel_set_clear(kernel_set<double> *const self)
  {
    self->clear();
  }
}

