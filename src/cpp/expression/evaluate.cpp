#include <emscripten.h>
#include <dcgp/expression.hpp>
#include <audi/gdual.hpp>
#include <audi/vectorized.hpp>
#include <vector>

#include "../utils/utils.hpp"

using namespace dcgp;

typedef audi::gdual<double> gdual_d;
typedef audi::gdual<audi::vectorized<double>> gdual_v;

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

  double *EMSCRIPTEN_KEEPALIVE expression_evaluate_gdual_d(
      const expression<gdual_d> *const self,
      const double *const inputs)
  {
    unsigned num_inputs = self->get_n();
    unsigned num_outputs = self->get_m();

    std::vector<gdual_d> input_vector;
    input_vector.reserve(num_inputs);

    for (size_t i = 0; i < num_inputs; i++)
    {
      input_vector.emplace_back(inputs[i]);
    }

    std::vector<gdual_d> results = self->operator()(input_vector);

    double *const ret = new double[num_outputs];

    for (size_t i = 0; i < num_outputs; i++)
    {
      ret[i] = results[i].constant_cf();
    }

    return ret;
  }

  double *EMSCRIPTEN_KEEPALIVE expression_evaluate_gdual_v(
      const expression<gdual_v> *const self,
      const double *const inputs,
      const unsigned inputs_length)
  {
    unsigned num_inputs = self->get_n();
    unsigned num_outputs = self->get_m();

    std::vector<gdual_v> input_vector;
    input_vector.reserve(num_inputs);

    for (size_t i = 0; i < num_inputs; i++)
    {
      input_vector.emplace_back(
          std::vector<double>(
              inputs + i * inputs_length,
              inputs + (i + 1) * inputs_length));
    }

    std::vector<gdual_v> results = self->operator()(input_vector);

    double *const ret = new double[num_outputs * inputs_length];

    for (size_t i = 0; i < num_outputs; i++)
    {
      audi::vectorized<double> tmp = results[i].constant_cf();
      std::vector<double> output_vector = tmp.get_v();

      memcpy(
          ret + i * inputs_length,
          &output_vector[0],
          sizeof(double) * inputs_length);
    }

    return ret;
  }
}
