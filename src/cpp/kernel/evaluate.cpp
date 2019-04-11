#include <emscripten.h>
#include <dcgp/kernel.hpp>
// #include <audi/gdual.hpp>
// #include <audi/vectorized.hpp>
#include <vector>

#include "../utils/utils.hpp"

using namespace dcgp;

// typedef audi::gdual<double> gdual_d;
// typedef audi::gdual<audi::vectorized<double>> gdual_v;

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

  // double EMSCRIPTEN_KEEPALIVE kernel_evaluate_gdual_d(
  //     const kernel<gdual_d> *const self,
  //     const double *const inputs,
  //     const unsigned num_inputs)
  // {
  //   std::vector<gdual_d> input_vector;
  //   input_vector.reserve(num_inputs);

  //   for (size_t i = 0; i < num_inputs; i++)
  //   {
  //     input_vector.emplace_back(inputs[i]);
  //   }

  //   gdual_d result = self->operator()(input_vector);

  //   double ret = result.constant_cf();
  //   return ret;
  // }

  // double *EMSCRIPTEN_KEEPALIVE kernel_evaluate_gdual_v(
  //     const kernel<gdual_v> *const self,
  //     const double *const inputs,
  //     const unsigned num_inputs,
  //     const unsigned inputs_length)
  // {
  //   std::vector<gdual_v> input_vector;
  //   input_vector.reserve(num_inputs);

  //   for (size_t i = 0; i < num_inputs; i++)
  //   {
  //     input_vector.emplace_back(
  //         std::vector<double>(
  //             inputs + i * inputs_length,
  //             inputs + (i + 1) * inputs_length));
  //   }

  //   gdual_v result = self->operator()(input_vector);

  //   double *const ret = new double[inputs_length];

  //   audi::vectorized<double> constants_audi_vect = result.constant_cf();
  //   std::vector<double> output_vector = constants_audi_vect.get_v();

  //   memcpy(ret, &output_vector[0], sizeof(double) * inputs_length);

  //   return ret;
  // }
}
