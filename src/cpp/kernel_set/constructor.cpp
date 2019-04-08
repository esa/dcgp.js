#include <emscripten.h>
#include <dcgp/kernel_set.hpp>
#include <audi/gdual.hpp>
#include <audi/vectorized.hpp>

#include "../utils/utils.hpp"

using namespace dcgp;

typedef audi::gdual<double> gdual_d;
typedef audi::gdual<audi::vectorized<double>> gdual_v;

// empty constructor
extern "C"
{
  kernel_set<double> *EMSCRIPTEN_KEEPALIVE kernel_set_constructor_0()
  {
    return new kernel_set<double>();
  }

  kernel_set<gdual_d> *EMSCRIPTEN_KEEPALIVE kernel_set_constructor_0_gdual_d()
  {
    return new kernel_set<gdual_d>();
  }

  kernel_set<gdual_v> *EMSCRIPTEN_KEEPALIVE kernel_set_constructor_0_gdual_v()
  {
    return new kernel_set<gdual_v>();
  }
}

template <typename T>
kernel_set<T> *constructor(const char *const names, unsigned num_names)
{
  std::vector<std::string> kernel_names;
  fill_strings_vector(kernel_names, names, num_names);

  return new kernel_set<T>(kernel_names);
}

// vector constructor
extern "C"
{
  kernel_set<double> *EMSCRIPTEN_KEEPALIVE kernel_set_constructor_1(
      const char *const names,
      unsigned num_names)
  {
    return constructor<double>(names, num_names);
  }

  kernel_set<gdual_d> *EMSCRIPTEN_KEEPALIVE kernel_set_constructor_1_gdual_d(
      const char *const names,
      unsigned num_names)
  {
    return constructor<gdual_d>(names, num_names);
  }

  kernel_set<gdual_v> *EMSCRIPTEN_KEEPALIVE kernel_set_constructor_1_gdual_v(
      const char *const names,
      unsigned num_names)
  {
    return constructor<gdual_v>(names, num_names);
  }
}
