#include <emscripten.h>
#include <dcgp/kernel_set.hpp>
#include <dcgp/kernel.hpp>

#include "../utils/utils.hpp"

using namespace dcgp;

// add kernel by name
extern "C"
{
  void EMSCRIPTEN_KEEPALIVE kernel_set_push_back_0(
      kernel_set<double> *const self,
      const char *const name)
  {
    std::string kernel_name(name);

    self->push_back(kernel_name);
  }

  // add kernel by pointer
  void EMSCRIPTEN_KEEPALIVE kernel_set_push_back_1(
      kernel_set<double> *const self,
      const kernel<double> *const kernel_object)
  {
    self->push_back(*kernel_object);
  }
}
