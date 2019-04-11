#include <emscripten.h>
#include <vector>
#include <functional>
#include <algorithm>
#include <iterator>
#include <dcgp/expression.hpp>
// #include <audi/gdual.hpp>
// #include <audi/vectorized.hpp>

#include "./helpers.hpp"

using namespace dcgp;

// typedef audi::gdual<double> gdual_d;
// typedef audi::gdual<audi::vectorized<double>> gdual_v;

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

    // double EMSCRIPTEN_KEEPALIVE algorithm_mu_plus_lambda_gdual_d(
    //     expression<gdual_d> *const self,
    //     const unsigned mu,
    //     const unsigned lambda,
    //     const unsigned max_gen,
    //     const double *const x_array,
    //     const double *const yt_array,
    //     const unsigned xy_length,
    //     double *const constants,
    //     const unsigned constants_length)
    // {
    //   const unsigned num_inputs = self->get_n();
    //   const unsigned num_outputs = self->get_m();

    //   vector<vector<gdual_d>> x(xy_length, vector<gdual_d>(num_inputs));
    //   vector<vector<gdual_d>> yt(xy_length, vector<gdual_d>(num_outputs));

    //   vector<gdual_d> consts_vect(constants_length);
    //   for (size_t i = 0; i < constants_length; i++)
    //   {
    //     consts_vect[i] = gdual_d(constants[i], "c" + std::to_string(i), 0);
    //   }

    //   fill_vector_grid<gdual_d>(
    //       x, yt,
    //       x_array, yt_array, xy_length,
    //       num_inputs, num_outputs,
    //       consts_vect);

    //   function<double(void)> get_loss = [&self, &x, &yt]() -> double {
    //     gdual_d loss = self->loss(x, yt, "MSE");
    //     return loss.constant_cf();
    //   };

    //   double lowest_loss = mu_plus_lambda<gdual_d>(self, mu, lambda, max_gen, get_loss);

    //   return lowest_loss;
    // };

    // double EMSCRIPTEN_KEEPALIVE algorithm_mu_plus_lambda_gdual_v(
    //     expression<gdual_v> *const self,
    //     const unsigned mu,
    //     const unsigned lambda,
    //     const unsigned max_gen,
    //     const double *const x_array,
    //     const double *const yt_array,
    //     const unsigned xy_length,
    //     double *const constants,
    //     const unsigned constants_length)
    // {
    //   const unsigned num_inputs = self->get_n();
    //   const unsigned num_outputs = self->get_m();

    //   vector<vector<double>> x_double(num_inputs, vector<double>(xy_length));
    //   vector<vector<double>> yt_double(num_outputs, vector<double>(xy_length));

    //   vector<double> consts_vect(constants, constants + constants_length);

    //   const unsigned inputs_length = num_inputs - constants_length;

    //   for (size_t i = 0; i < xy_length; i++)
    //   {
    //     for (size_t j = 0; j < num_inputs; j++)
    //     {
    //       if (j >= inputs_length)
    //       {
    //         x_double[j][i] = consts_vect[j - inputs_length];
    //       }
    //       else
    //       {
    //         x_double[j][i] = x_array[i * inputs_length + j];
    //       }
    //     }

    //     for (size_t j = 0; j < num_outputs; j++)
    //     {
    //       yt_double[j][i] = yt_array[i * num_outputs + j];
    //     }
    //   }

    //   vector<gdual_v> x;
    //   x.reserve(num_inputs);

    //   vector<gdual_v> yt;
    //   yt.reserve(num_outputs);

    //   for (size_t i = 0; i < num_inputs; i++)
    //   {
    //     x.emplace_back(x_double[i]);
    //   }

    //   for (size_t i = 0; i < num_outputs; i++)
    //   {
    //     yt.emplace_back(yt_double[i]);
    //   }

    //   function<double(void)> get_loss = [&self, &x, &yt]() -> double {
    //     gdual_v loss = self->loss(x, yt, expression<gdual_v>::loss_type::MSE);
    //     vector<double> losses = loss.constant_cf().get_v();

    //     double retval(0.0);

    //     for (size_t i = 0; i < losses.size(); i++)
    //     {
    //       retval += losses[i];
    //     }

    //     retval /= static_cast<double>(losses.size());

    //     return retval;
    //   };

    //   double lowest_loss = mu_plus_lambda<gdual_v>(self, mu, lambda, max_gen, get_loss);

    //   return lowest_loss;
    // };
  }
