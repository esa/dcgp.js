#include <emscripten.h>
#include <dcgp/expression.hpp>
#include <vector>

#include "../utils/utils.hpp"

using namespace dcgp;

extern "C"
{
  double *EMSCRIPTEN_KEEPALIVE expression_evaluate(
      const expression<double> *const self,
      const double *const inputs)
  {
    unsigned num_inputs = self->get_n();
    unsigned num_outputs = self->get_m();

    std::vector<double> input_vector(inputs, inputs + num_inputs);

    std::vector<double> results = self->operator()(input_vector);

    double *ret = array_to_heap<double>(&results[0], num_outputs);

    return ret;
  }
}
