#include <emscripten.h>
#include <vector>
#include <cmath>
#include <functional>
#include <algorithm>
#include <iterator>
#include <limits>
#include <dcgp/expression.hpp>
#include <audi/gdual.hpp>
#include <audi/vectorized.hpp>

#include "./gradient_descent.hpp"
#include "./mu_plus_lambda.hpp"
#include "../utils/utils.hpp"
#include "../expression/expression.hpp"

typedef audi::gdual<audi::vectorized<double>> gdual_v;

using namespace dcgp;
using std::function;
using std::vector;

extern "C"
{
  // Combine the mu plus lambda and the gradient descent algorithms
  double EMSCRIPTEN_KEEPALIVE algorithm_hybrid(
      custom_expression<double> *const self,
      const unsigned mu,
      const unsigned lambda,
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
    // use separate scope to remove unnecessary variable from memory stack during gradient descent.
    {
      vector<vector<double>> x_double(num_inputs, vector<double>(xy_length));
      vector<vector<double>> yt_double(num_outputs, vector<double>(xy_length));

      for (size_t i = 0; i < xy_length; i++)
      {
        for (size_t j = 0; j < inputs_length; j++)
          x_double[j][i] = x_array[j * xy_length + i];

        for (size_t j = 0; j < num_outputs; j++)
          yt_double[j][i] = yt_array[j * xy_length + i];
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

    expression<gdual_v> *gdual_v_expression = convert_expression_type<double, gdual_v>(self);

    // now gradient descent takes max_steps before returning.
    // this results in max_steps * max_steps being executed before giving feedback.
    function<double(void)> get_loss = [&gdual_v_expression, &max_steps, &x, &yt, &constants_length]() -> double {
      return gradient_descent(
          gdual_v_expression, max_steps, x, yt, constants_length);
    };

    double lowest_loss = mu_plus_lambda<gdual_v>(gdual_v_expression, mu, lambda, max_steps, get_loss);

    delete gdual_v_expression;

    // update the provided constants to the learned constants
    // so that the javascript side can look at the values.
    for (size_t i = 0; i < constants_length; i++)
    {
      // select index 0 because we can be sure
      // that the vector only contains one entry
      constants[i] = x[i + inputs_length].constant_cf()[0];
    }

    return lowest_loss;
  };
}
