#include <emscripten.h>
#include <dcgp/kernel.hpp>

using namespace dcgp;

extern "C"
{
  void EMSCRIPTEN_KEEPALIVE kernel_destroy(const kernel<double> *const self)
  {
    delete self;
  }
}
