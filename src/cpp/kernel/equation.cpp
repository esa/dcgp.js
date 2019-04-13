#include <emscripten.h>
#include <dcgp/kernel.hpp>
#include <vector>
#include <string>

#include "../utils/utils.hpp"

using namespace dcgp;

extern "C"
{
  char *EMSCRIPTEN_KEEPALIVE kernel_equation(
      const kernel<double> *const self,
      const char *const inputs,
      const unsigned num_inputs)
  {
    std::vector<std::string> input_strings;
    fill_strings_vector(input_strings, inputs, num_inputs);

    std::string result = self->operator()(input_strings);

    char *ret = new char[result.length() + 1];
    strcpy(ret, result.c_str());

    return ret;
  }
}
