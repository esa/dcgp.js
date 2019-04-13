#include <emscripten.h>
#include <dcgp/kernel.hpp>
#include <vector>

#include "../utils/utils.hpp"

using namespace dcgp;

extern "C"
{
  double EMSCRIPTEN_KEEPALIVE kernel_evaluate(
      const kernel<double> *const self,
      const double *const inputs,
      const unsigned num_inputs)
  {
    std::vector<double> input_vector(inputs, inputs + num_inputs);

    double result = self->operator()(input_vector);
    return result;
  }
}
