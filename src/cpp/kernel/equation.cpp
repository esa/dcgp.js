#include <emscripten.h>
#include <dcgp/kernel.hpp>
#include <audi/gdual.hpp>
#include <audi/vectorized.hpp>
#include <vector>
#include <string>

#include "../utils/utils.hpp"

using namespace dcgp;

typedef audi::gdual<double> gdual_d;
typedef audi::gdual<audi::vectorized<double>> gdual_v;

template <typename T>
char *equation(
    const kernel<T> *const self,
    const char *const input_chars,
    const unsigned &num_inputs)
{
  std::vector<std::string> input_strings;
  fill_strings_vector(input_strings, input_chars, num_inputs);

  std::string result = self->operator()(input_strings);

  char *ret = new char[result.length() + 1];
  strcpy(ret, result.c_str());

  return ret;
}

extern "C"
{
  char *EMSCRIPTEN_KEEPALIVE kernel_equation(
      const kernel<double> *const self,
      const char *const inputs,
      const unsigned num_inputs)
  {
    return equation<double>(self, inputs, num_inputs);
  }

  char *EMSCRIPTEN_KEEPALIVE kernel_equation_gdual_d(
      const kernel<gdual_d> *const self,
      const char *const inputs,
      const unsigned num_inputs)
  {
    return equation<gdual_d>(self, inputs, num_inputs);
  }

  char *EMSCRIPTEN_KEEPALIVE kernel_equation_gdual_v(
      const kernel<gdual_v> *const self,
      const char *const inputs,
      const unsigned num_inputs)
  {
    return equation<gdual_v>(self, inputs, num_inputs);
  }
}
