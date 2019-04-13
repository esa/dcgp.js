#include <emscripten.h>
#include <dcgp/expression.hpp>
#include <vector>
#include <string>

#include "../utils/utils.hpp"

using namespace dcgp;

extern "C"
{
  char *EMSCRIPTEN_KEEPALIVE expression_equation(
      const expression<double> *const self,
      const char *const inputs)
  {
    unsigned num_inputs = self->get_n();

    std::vector<std::string> input_strings;
    fill_strings_vector(input_strings, inputs, num_inputs);

    std::vector<std::string> result = self->operator()(input_strings);

    unsigned num_outputs = self->get_m();
    unsigned total_length = 0;

    for (size_t i = 0; i < num_outputs; i++)
    {
      total_length += result[i].length() + 1;
    }

    char *ret = new char[total_length];

    {
      unsigned shifted(0);

      for (size_t i = 0; i < num_outputs; i++)
      {
        strcpy(&ret[shifted], result[i].c_str());
        shifted += result[i].length() + 1;
      }
    }

    return ret;
  }
}
