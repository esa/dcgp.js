#include <emscripten.h>
#include <dcgp/kernel_set.hpp>
#include <dcgp/kernel.hpp>
#include <audi/gdual.hpp>
#include <audi/vectorized.hpp>

#include "../utils/utils.hpp"

using namespace dcgp;

typedef audi::gdual<double> gdual_d;
typedef audi::gdual<audi::vectorized<double>> gdual_v;

template <typename T>
void push_back_0(kernel_set<T> *const self, const char *const name)
{
  std::string kernel_name(name);

  self->push_back(kernel_name);
}

// add kernel by name
extern "C"
{
  void EMSCRIPTEN_KEEPALIVE kernel_set_push_back_0(
      kernel_set<double> *const self,
      const char *const name)
  {
    push_back_0<double>(self, name);
  }

  void EMSCRIPTEN_KEEPALIVE kernel_set_push_back_0_gdual_d(
      kernel_set<gdual_d> *const self,
      const char *const name)
  {
    push_back_0<gdual_d>(self, name);
  }

  void EMSCRIPTEN_KEEPALIVE kernel_set_push_back_0_gdual_v(
      kernel_set<gdual_v> *const self,
      const char *const name)
  {
    push_back_0<gdual_v>(self, name);
  }
}

// add kernel by pointer
extern "C"
{
  void EMSCRIPTEN_KEEPALIVE kernel_set_push_back_1(
      kernel_set<double> *const self,
      const kernel<double> *const kernel_object)
  {
    self->push_back(*kernel_object);
  }

  void EMSCRIPTEN_KEEPALIVE kernel_set_push_back_1_gdual_d(
      kernel_set<gdual_d> *const self,
      const kernel<gdual_d> *const kernel_object)
  {
    self->push_back(*kernel_object);
  }

  void EMSCRIPTEN_KEEPALIVE kernel_set_push_back_1_gdual_v(
      kernel_set<gdual_v> *const self,
      const kernel<gdual_v> *const kernel_object)
  {
    self->push_back(*kernel_object);
  }
}
