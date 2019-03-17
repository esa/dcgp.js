#include <emscripten.h>
#include <vector>

#include "dcgp/expression.hpp"

using namespace dcgp;
using std::vector;

// expression.cpp
extern "C"
{
  // one plus lambda evolution algorithm
  double EMSCRIPTEN_KEEPALIVE embind_one_plus_lambda(expression<double> *const self, const unsigned offsprings, const unsigned max_gen, const double *const x_array, double *const y_array, const unsigned xy_length)
  {
    vector<unsigned> best_chromosome = self->get();

    vector<vector<unsigned>> chromosomes(offsprings, vector<uint32_t>(best_chromosome.size()));
    vector<double> fitness(offsprings);

    const unsigned int inputs = self->get_n();
    const unsigned int outputs = self->get_m();
    vector<vector<double>> x(xy_length, vector<double>(inputs));
    vector<vector<double>> yt(xy_length, vector<double>(outputs));

    for (size_t i = 0; i < xy_length; i++)
    {
      for (size_t j = 0; j < inputs; j++)
      {
        x[i][j] = x_array[i * inputs + j];
      }

      for (size_t j = 0; j < outputs; j++)
      {
        yt[i][j] = y_array[i * outputs + j];
      }
    }

    auto get_fitness = [&self, &x, &yt]() { return self->loss(x, yt, "MSE", 0u); };

    double best_fitness = get_fitness();

    for (unsigned int g = 0; g < max_gen; g++)
    {
      for (unsigned int i = 0; i < offsprings; i++)
      {
        self->set(best_chromosome);
        self->mutate_active(i + 1);

        double fit = get_fitness();

        fitness[i] = fit;
        chromosomes[i] = self->get();

        if ((fitness[i] <= best_fitness) && (fitness[i] != best_fitness))
        {
          best_chromosome = chromosomes[i];
          best_fitness = fitness[i];
          self->set(best_chromosome);
        };
      };

      if (best_fitness < 1e-14)
      {
        break;
      };
    };

    self->set(best_chromosome);
    return best_fitness;
  };
}
