#include <emscripten.h>
#include <vector>
#include <functional>
#include <algorithm>
#include <iterator>
#include <dcgp/expression.hpp>
#include <audi/gdual.hpp>
#include <audi/vectorized.hpp>

#include "./helpers.hpp"
#include "../utils/utils.hpp"

using namespace dcgp;

// typedef audi::gdual<double> gdual_d;
typedef audi::gdual<audi::vectorized<double>> gdual_v;

using namespace dcgp;
using std::function;
using std::vector;

double gradient_descent(
    expression<gdual_v> *const self,
    const double &learning_rate,
    const unsigned &max_steps,
    vector<gdual_v> &inputs,
    const vector<gdual_v> &labels,
    const unsigned &num_constants)
{
  const unsigned constants_offset = inputs.size() - num_constants;
  double loss(0.0);

  gdual_v gdual_v_loss = self->loss(inputs, labels, expression<gdual_v>::loss_type::MSE);

  for(size_t s = 0; s < max_steps; s++)
  {
    loss = 0.0;

    for(size_t i = 0; i < num_constants; i++)
    {
      double dC(0.0);

      audi::vectorized<double> dC_vect = gdual_v_loss.get_derivative({{"dC" + std::to_string(i + 1), 1}});

      for (size_t j = 0; j < dC_vect.size(); j++)
        dC += dC_vect[j];

      dC /= static_cast<double>(dC_vect.size());

      inputs[constants_offset + i] -= dC * learning_rate;
    }

    gdual_v_loss = self->loss(inputs, labels, expression<gdual_v>::loss_type::MSE);

    audi::vectorized<double> loss_vect = gdual_v_loss.constant_cf();

    for (size_t i = 0; i < loss_vect.size(); i++)
      loss += loss_vect[i];

    loss /= static_cast<double>(loss_vect.size());

    if (loss < 1e-14)
      break;
  }

  return loss;
}

extern "C"
{
  double EMSCRIPTEN_KEEPALIVE algorithm_gradient_descent(
      expression<double> *const self,
      const double learning_rate,
      const unsigned max_steps,
      const double *const x_array,
      const double *const yt_array,
      const unsigned xy_length,
      double *const constants,
      const unsigned constants_length)
  {
    const unsigned num_inputs = self->get_n();
    const unsigned num_outputs = self->get_m();
    const unsigned inputs_length = num_inputs - constants_length;

    vector<gdual_v> x;
    x.reserve(num_inputs);

    vector<gdual_v> yt;
    yt.reserve(num_outputs);

    // fill the x and yt vectors with the transposed provided x_array and yt_array.
    // use seperate scope to remove unnecessary variable from memory stack during gradient descent.
    {
      vector<vector<double>> x_double(num_inputs, vector<double>(xy_length));
      vector<vector<double>> yt_double(num_outputs, vector<double>(xy_length));

      for (size_t i = 0; i < xy_length; i++)
      {
        for (size_t j = 0; j < inputs_length; j++)
          x_double[j][i] = x_array[i * inputs_length + j];

        for (size_t j = 0; j < num_outputs; j++)
          yt_double[j][i] = yt_array[i * num_outputs + j];
      }

      for (size_t i = 0; i < inputs_length; i++)
        x.emplace_back(x_double[i]);

      for (size_t i = 0; i < constants_length; i++)
        x.emplace_back(
            audi::vectorized<double>({constants[i]}),
            // name the constants C1, C2, ...
            "C" + std::to_string(i + 1),
            1);

      for (size_t i = 0; i < num_outputs; i++)
        yt.emplace_back(yt_double[i]);
    }

    // the seed argument is not important since we're not doing anything random in this algorithm.
    expression<gdual_v> *gdual_v_expression = convert_expression_type<double, gdual_v>(self, 1);

    double lowest_loss = gradient_descent(
        gdual_v_expression,
        learning_rate,
        max_steps,
        x, yt,
        constants_length);

    delete gdual_v_expression;

    // update the provided constants to the learned constants
    // so that the javascript side can look at the values.
    for (size_t i = 0; i < constants_length; i++)
      // select index 0 because we can be sure
      // that the vector only contains one entry
      constants[i] = x[i + inputs_length].constant_cf()[0];

    return lowest_loss;
  };
}
