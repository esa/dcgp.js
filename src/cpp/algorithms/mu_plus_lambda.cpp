#include <emscripten.h>
#include <vector>
#include <cmath>
#include <functional>
#include <algorithm>
#include <iterator>
#include <dcgp/expression.hpp>

#include "../utils/utils.hpp"

using namespace dcgp;
using std::function;
using std::vector;

struct Member
{
  std::vector<unsigned> chromosome;
  double loss;

  static bool compare(const Member m1, const Member m2)
  {
    if (std::isfinite(m1.loss) && !std::isfinite(m2.loss))
      return true;

    return (m1.loss < m2.loss);
  };
};

Member mu_plus_lambda(
    expression<double> *const self,
    const unsigned &mu,
    const unsigned &lambda,
    const unsigned &max_steps,
    function<double(void)> get_loss)
{
  vector<Member> population(mu + lambda, Member());

  {
    vector<unsigned> initial_chromosome = self->get();
    double initial_loss = get_loss();

    for (size_t i = 0; i < mu; i++)
    {
      population[i].chromosome = initial_chromosome;
      population[i].loss = initial_loss;
    }
  }

  for (unsigned int s = 0; s < max_steps; s++)
  {
    // generate new population
    for (unsigned int i = 0; i < lambda; i++)
    {
      self->set(population[i % mu].chromosome);
      self->mutate_active(i + 1);

      population[mu + i].chromosome = self->get();
      population[mu + i].loss = get_loss();
    }

    // sort population from best to worst
    std::sort(population.begin(), population.end(), Member::compare);

    if (population[0].loss < 1e-14)
      break;
  }

  self->set(population[0].chromosome);

  return population[0];
}

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

    function<double(void)> get_loss = [&self, &x, &yt]() -> double {
      return self->loss(x, yt, "MSE");
    };

    Member best_member = mu_plus_lambda(self, mu, lambda, max_steps, get_loss);

    return best_member.loss;
  };
}
