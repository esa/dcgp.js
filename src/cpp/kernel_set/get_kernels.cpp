#include <emscripten.h>
#include <dcgp/kernel_set.hpp>
#include <dcgp/kernel.hpp>
#include <audi/gdual.hpp>
#include <audi/vectorized.hpp>
#include <vector>

using namespace dcgp;

typedef audi::gdual<double> gdual_d;
typedef audi::gdual<audi::vectorized<double>> gdual_v;

// get number of kernels in set
extern "C"
{
  unsigned EMSCRIPTEN_KEEPALIVE kernel_set_num_kernels(
      const kernel_set<double> *const self)
  {
    std::vector<kernel<double>> kernels = self->operator()();

    return kernels.size();
  }

  unsigned EMSCRIPTEN_KEEPALIVE kernel_set_num_kernels_gdual_d(
      const kernel_set<gdual_d> *const self)
  {
    std::vector<kernel<gdual_d>> kernels = self->operator()();

    return kernels.size();
  }

  unsigned EMSCRIPTEN_KEEPALIVE kernel_set_num_kernels_gdual_v(
      const kernel_set<gdual_v> *const self)
  {
    std::vector<kernel<gdual_v>> kernels = self->operator()();

    return kernels.size();
  }
}

template <typename T>
void get_kernels(const kernel_set<T> *const self, const kernel<T> **const kernels_array)
{
  std::vector<kernel<T>> kernels = self->operator()();

  for (size_t i = 0; i < kernels.size(); i++)
  {
    // copy to heap memory
    kernel<T> *kernel_object = new kernel<T>(kernels[i]);

    kernels_array[i] = kernel_object;
  }
}

// set kernel pointers in array
extern "C"
{
  void EMSCRIPTEN_KEEPALIVE kernel_set_get_kernels(
      const kernel_set<double> *const self,
      const kernel<double> **const kernels_array)
  {
    get_kernels<double>(self, kernels_array);
  }

  void EMSCRIPTEN_KEEPALIVE kernel_set_get_kernels_gdual_d(
      const kernel_set<gdual_d> *const self,
      const kernel<gdual_d> **const kernels_array)
  {
    get_kernels<gdual_d>(self, kernels_array);
  }

  void EMSCRIPTEN_KEEPALIVE kernel_set_get_kernels_gdual_v(
      const kernel_set<gdual_v> *const self,
      const kernel<gdual_v> **const kernels_array)
  {
    get_kernels<gdual_v>(self, kernels_array);
  }
}
