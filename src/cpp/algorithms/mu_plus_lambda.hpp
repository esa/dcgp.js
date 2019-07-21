#pragma once

#include <vector>
#include <cmath>
#include <functional>
#include <dcgp/expression.hpp>
#include <functional>
#include <algorithm>
#include <iterator>

using namespace dcgp;
using std::function;
using std::vector;

// A member of the population
struct Member
{
  std::vector<unsigned> chromosome;
  double loss;

  static bool compare(const Member, const Member);
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

    // sort population from best to worst
    std::sort(population.begin(), population.end(), Member::compare);

    if (population[0].loss < 1e-14)
      break;
  }

  self->set(population[0].chromosome);

  return population[0].loss;
}
