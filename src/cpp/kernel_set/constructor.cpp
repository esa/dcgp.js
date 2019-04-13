#include <emscripten.h>
#include <dcgp/kernel_set.hpp>

#include "../utils/utils.hpp"

using namespace dcgp;

// empty constructor
extern "C"
{
  kernel_set<double> *EMSCRIPTEN_KEEPALIVE kernel_set_constructor_0()
  {
    return new kernel_set<double>();
  }

  // vector constructor
  kernel_set<double> *EMSCRIPTEN_KEEPALIVE kernel_set_constructor_1(
      const char *const names,
      unsigned num_names)
  {
    std::vector<std::string> kernel_names;
    fill_strings_vector(kernel_names, names, num_names);

    return new kernel_set<double>(kernel_names);
  }
}
