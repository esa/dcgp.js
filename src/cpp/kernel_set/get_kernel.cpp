#include <emscripten.h>
#include <dcgp/kernel_set.hpp>
#include <dcgp/kernel.hpp>
// #include <audi/gdual.hpp>
// #include <audi/vectorized.hpp>

using namespace dcgp;

// typedef audi::gdual<double> gdual_d;
// typedef audi::gdual<audi::vectorized<double>> gdual_v;

template <typename T>
kernel<T> *get_kernel(const kernel_set<T>* const self, const unsigned &index)
{
  kernel<T> tmp_kernel = self->operator[](index);

  // copy to heap memory
  return new kernel<T>(tmp_kernel);
}

// set kernel pointers in array
extern "C"
{
  kernel<double> *EMSCRIPTEN_KEEPALIVE kernel_set_get_kernel(
    const kernel_set<double>* const self,
    const unsigned index)
  {
    return get_kernel<double>(self, index);
  }

  // kernel<gdual_d> *EMSCRIPTEN_KEEPALIVE kernel_set_get_kernel_gdual_d(
  //   const kernel_set<gdual_d>* const self,
  //   const unsigned index)
  // {
  //   return get_kernel<gdual_d>(self, index);
  // }

  // kernel<gdual_v> *EMSCRIPTEN_KEEPALIVE kernel_set_get_kernel_gdual_v(
  //   const kernel_set<gdual_v>* const self,
  //   const unsigned index)
  // {
  //   return get_kernel<gdual_v>(self, index);
  // }
}
