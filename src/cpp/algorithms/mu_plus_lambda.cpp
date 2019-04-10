#include <emscripten.h>
#include <vector>
#include <functional>
#include <algorithm>
#include <iterator>
#include <dcgp/expression.hpp>
#include <audi/gdual.hpp>
#include <audi/vectorized.hpp>

#include "./helpers.hpp"

using namespace dcgp;

typedef audi::gdual<double> gdual_d;
typedef audi::gdual<audi::vectorized<double>> gdual_v;

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
    const unsigned &max_gen,
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

  for (unsigned int g = 0; g < max_gen; g++)
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
      const unsigned max_gen,
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

    vector<double> consts_vect(constants, constants + constants_length);

    fill_vector_grid<double>(
        x, yt,
        x_array, yt_array, xy_length,
        num_inputs, num_outputs,
        consts_vect);

    function<double(void)> get_loss = [&self, &x, &yt]() -> double { return self->loss(x, yt, "MSE"); };

    double lowest_loss = mu_plus_lambda<double>(self, mu, lambda, max_gen, get_loss);

    return lowest_loss;
  };

  double EMSCRIPTEN_KEEPALIVE algorithm_mu_plus_lambda_gdual_d(
      expression<gdual_d> *const self,
      const unsigned mu,
      const unsigned lambda,
      const unsigned max_gen,
      const double *const x_array,
      const double *const yt_array,
      const unsigned xy_length,
      double *const constants,
      const unsigned constants_length)
  {
    const unsigned num_inputs = self->get_n();
    const unsigned num_outputs = self->get_m();

    vector<vector<gdual_d>> x(xy_length, vector<gdual_d>(num_inputs));
    vector<vector<gdual_d>> yt(xy_length, vector<gdual_d>(num_outputs));

    vector<gdual_d> consts_vect(constants_length);
    for(size_t i = 0; i < constants_length; i++)
    {
      consts_vect[i] = gdual_d(constants[i], "c" + std::to_string(i), 2);
    }

    fill_vector_grid<gdual_d>(
        x, yt,
        x_array, yt_array, xy_length,
        num_inputs, num_outputs,
        consts_vect);

    vector<gdual_d> inputs(num_inputs);

    function<double(void)> get_loss = [&self, &x, &yt, &consts_vect, &constants, &inputs]() -> double {
      gdual_d loss(0);

      for(size_t i = 0; i < x.size(); i++)
      {
        // create input vector point
        auto last = std::copy(std::begin(x[i]), std::end(x[i]), std::begin(inputs));
        std::copy(std::begin(consts_vect), std::end(consts_vect), last);

        loss += self->loss(inputs, yt[i], expression<gdual_d>::loss_type::MSE);
      }

      loss /= static_cast<double>(x.size());

      for (size_t i = 0; i < consts_vect.size(); i++)
      {
        double dc1 = loss.get_derivative({{"dc", 1}});
        double dc2 = loss.get_derivative({{"dc", 2}});

        if (dc2 != 0.0)
        {
          constants[i] -= dc1 / dc2;
        }
      }

      gdual_d loss = self->loss(x, yt, "MSE");
      return loss.constant_cf();
    };

    double lowest_loss = mu_plus_lambda<gdual_d>(self, mu, lambda, max_gen, get_loss);

    return lowest_loss;
  };
}
