#include <emscripten.h>
#include <vector>
#include <functional>
#include <algorithm>
#include <iterator>
#include <dcgp/expression.hpp>

#include "../utils/utils.hpp"

using namespace dcgp;
using std::function;
using std::vector;

// A member of the population
struct Member
{
  vector<unsigned> chromosome;
  double loss;

  static bool compare(const Member m1, const Member m2)
  {
    return (m1.loss < m2.loss);
  }
};

template <typename T>
double mu_plus_lambda(
    expression<T> *const self,
    const unsigned &mu,
    const unsigned &lambda,
    const unsigned &max_steps,
    function<double(void)> get_loss)
{
  vector<Member> population(mu + lambda);

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

    // sort population
    std::sort(population.begin(), population.end(), Member::compare);

    if (population[0].loss < 1e-14)
      break;
  }

  self->set(population[0].chromosome);

  return population[0].loss;
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
        x, yt,
        x_array, yt_array, xy_length,
        num_inputs, num_outputs,
        constants, constants_length);

    function<double(void)> get_loss = [&self, &x, &yt]() -> double { return self->loss(x, yt, "MSE"); };

    double lowest_loss = mu_plus_lambda<double>(self, mu, lambda, max_steps, get_loss);

    return lowest_loss;
  };
}
