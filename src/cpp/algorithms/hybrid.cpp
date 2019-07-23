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
#include "../utils/utils.hpp"

using namespace dcgp;
using std::function;
using std::vector;

// A member of the population
struct hybrid_member
{
  hybrid_member(
      double _loss,
      vector<unsigned> _chromosome,
      vector<double> _constants)
      : loss(_loss), chromosome(_chromosome), constants(_constants)
  {
  }

  static bool compare(const hybrid_member m1, const hybrid_member m2)
  {
    if (std::isfinite(m1.loss) && !std::isfinite(m2.loss))
      return true;

    return (m1.loss < m2.loss);
  };

  double loss;
  vector<unsigned> chromosome;
  vector<double> constants;
};

hybrid_member hybrid(
    expression<gdual_v> *const self,
    const unsigned &mu,
    const unsigned &lambda,
    const unsigned &max_steps,
    vector<gdual_v> &x,
    const vector<gdual_v> &yt,
    const unsigned &constants_length)
{
  gdual_v loss_expression;

  const unsigned num_inputs = self->get_n();
  const unsigned constants_offset = num_inputs - constants_length;
  const unsigned gd_max_steps = std::lround(std::max<double>(std::sqrt(max_steps), 10.0));

  double initial_loss = calc_loss(self, x, yt, loss_expression);
  vector<double> initial_constants(constants_length);
  vector<unsigned> initial_chromosome = self->get();

  for (size_t i = 0; i < constants_length; i++)
    initial_constants[i] = x[constants_offset + i].constant_cf()[0];

  vector<hybrid_member> population(
      mu + lambda,
      hybrid_member(
          initial_loss,
          initial_chromosome,
          initial_constants));

  for (size_t s = 0; s < max_steps; s++)
  {
    // generate new population
    for (size_t i = 0; i < lambda; i++)
    {
      self->set(population[i % mu].chromosome);
      self->mutate_active(i + 1);

      population[mu + i].chromosome = self->get();
    }

    for (size_t i = 0; i < population.size(); i++)
    {
      for (size_t j = 0; j < constants_length; j++)
      {
        x[constants_offset + j] = gdual_v(
            audi::vectorized<double>({population[i].constants[j]}),
            // name the constants C1, C2, ...
            "C" + std::to_string(j + 1),
            1);
      }

      self->set(population[i].chromosome);

      population[i].loss = gradient_descent(
          self,
          gd_max_steps,
          x, yt,
          constants_length);

      for (size_t j = 0; j < constants_length; j++)
      {
        population[i].constants[j] = x[constants_offset + j].constant_cf()[0];
      }
    }

    // sort population from best to worst
    std::sort(population.begin(), population.end(), hybrid_member::compare);

    if (population[0].loss < 1e-14)
      break;
  }

  self->set(population[0].chromosome);
  return population[0];
}

extern "C"
{
  // Combine the mu plus lambda and the gradient descent algorithms
  double EMSCRIPTEN_KEEPALIVE algorithm_hybrid(
      expression<double> *const self,
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
    const unsigned constants_offset = num_inputs - constants_length;

    vector<gdual_v> x;
    x.reserve(num_inputs);

    vector<gdual_v> yt;
    yt.reserve(num_outputs);

    // fill the x and yt vectors with the transposed provided x_array and yt_array.
    // use separate scope to remove unnecessary variable from memory stack during gradient descent.
    {
      vector<vector<double>> x_double(constants_offset, vector<double>(xy_length));
      vector<vector<double>> yt_double(num_outputs, vector<double>(xy_length));

      for (size_t i = 0; i < xy_length; i++)
      {
        for (size_t j = 0; j < constants_offset; j++)
          x_double[j][i] = x_array[j * xy_length + i];

        for (size_t j = 0; j < num_outputs; j++)
          yt_double[j][i] = yt_array[j * xy_length + i];
      }

      for (size_t i = 0; i < constants_offset; i++)
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

    // Note: doesn't keep the correct seed. The seed is set to a random seed but
    // should keep the current seed and swap it again when done.
    expression<gdual_v> *gdual_v_expression = convert_expression_type<double, gdual_v>(self);

    hybrid_member best_member = hybrid(
        gdual_v_expression,
        mu,
        lambda,
        max_steps,
        x, yt,
        constants_length);

    self->set(best_member.chromosome);

    delete gdual_v_expression;

    // update the provided constants to the learned constants
    // so that the javascript side can look at the values.
    for (size_t i = 0; i < constants_length; i++)
    {
      constants[i] = best_member.constants[i];
    }

    return best_member.loss;
  };
}
