#include <emscripten.h>
#include <dcgp/kernel_set.hpp>
#include <dcgp/kernel.hpp>

using namespace dcgp;

extern "C"
{
  kernel<double> *EMSCRIPTEN_KEEPALIVE kernel_set_get_kernel(
    const kernel_set<double>* const self,
    const unsigned index)
  {
    kernel<double> tmp_kernel = self->operator[](index);

    // copy to heap memory
    return new kernel<double>(tmp_kernel);
  }
}
