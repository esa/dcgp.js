#include <emscripten.h>
#include <vector>
#include <cmath>
#include <functional>
#include <algorithm>
#include <iterator>
#include <dcgp/expression.hpp>

#include "../utils/utils.hpp"
#include "./mu_plus_lambda.hpp"

using namespace dcgp;
using std::function;
using std::vector;

// A member of the population
bool Member::compare(const Member m1, const Member m2)
{
  if (std::isfinite(m1.loss) && !std::isfinite(m2.loss))
    return true;

  return (m1.loss < m2.loss);
};

extern "C"
{
  double EMSCRIPTEN_KEEPALIVE algorithm_mu_plus_lambda(
      expression<double> *const self,
      const unsigned mu,
      const unsigned lambda,
      const unsigned max_steps,
      const double *const x_array,
      const double *const yt_array,
      const unsigned xy_length,
      const double *const constants,
      const unsigned constants_length)
  {
    const unsigned num_inputs = self->get_n();
    const unsigned num_outputs = self->get_m();

    vector<vector<double>> x(xy_length, vector<double>(num_inputs));
    vector<vector<double>> yt(xy_length, vector<double>(num_outputs));

    fill_vector_grid<double>(
        x, x_array,
        xy_length, num_inputs,
        constants, constants_length);

    fill_vector_grid<double>(
        yt, yt_array,
        xy_length, num_outputs);

    function<double(void)> get_loss = [&self, &x, &yt]() -> double { return self->loss(x, yt, "MSE"); };

    double lowest_loss = mu_plus_lambda<double>(self, mu, lambda, max_steps, get_loss);

    return lowest_loss;
  };
}
