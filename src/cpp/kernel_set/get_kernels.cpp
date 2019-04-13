#include <emscripten.h>
#include <dcgp/kernel_set.hpp>
#include <dcgp/kernel.hpp>
#include <vector>

using namespace dcgp;

// get number of kernels in set
extern "C"
{
  unsigned EMSCRIPTEN_KEEPALIVE kernel_set_num_kernels(
      const kernel_set<double> *const self)
  {
    std::vector<kernel<double>> kernels = self->operator()();

    return kernels.size();
  }
}

// set kernel pointers in array
extern "C"
{
  void EMSCRIPTEN_KEEPALIVE kernel_set_get_kernels(
      const kernel_set<double> *const self,
      const kernel<double> **const kernels_array)
  {
    std::vector<kernel<double>> kernels = self->operator()();

    for (size_t i = 0; i < kernels.size(); i++)
    {
      // copy to heap memory
      kernel<double> *kernel_object = new kernel<double>(kernels[i]);

      kernels_array[i] = kernel_object;
    }
  }
}
