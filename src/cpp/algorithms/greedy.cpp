// #include <emscripten.h>
// #include <vector>
// #include <functional>
// #include <dcgp/expression.hpp>

// #include "../utils/utils.hpp"

// using namespace dcgp;
// using std::vector;

// template <typename T>
// double greedy(
//     expression<T> *const self,
//     const unsigned &max_gen,
//     std::function<double(void)> get_fitness,
//     std::function<void(void)> find_constants = []() -> void {})
// {
//   vector<unsigned> best_chromosome = self->get();
//   double best_fitness = get_fitness();

//   vector<vector<unsigned>> chromosomes(lambda, vector<unsigned>(best_chromosome.size()));
//   vector<double> fitness(lambda);

//   for (unsigned int g = 0; g < max_gen; g++)
//   {
//     for (unsigned int i = 0; i < lambda; i++)
//     {
//       self->set(best_chromosome);
//       self->mutate_active(i + 1);

//       chromosomes[i] = self->get();

//       find_constants();

//       fitness[i] = get_fitness();
//     }

//     for (unsigned int i = 0; i < lambda; i++)
//     {
//       if (fitness[i] < best_fitness)
//       {
//         best_chromosome = chromosomes[i];
//         best_fitness = fitness[i];
//       };
//     };

//     if (best_fitness < 1e-14)
//     {
//       break;
//     };
//   }

//   self->set(best_chromosome);

//   return best_fitness;
// }

// // expression.cpp
// extern "C"
// {
//   // one plus lambda evolution algorithm
//   double EMSCRIPTEN_KEEPALIVE algorithm_mu_plus_lambda(
//       expression<double> *const self,
//       const unsigned mu,
//       const unsigned lambda,
//       const unsigned max_gen,
//       const double *const x_array,
//       const double *const yt_array,
//       const unsigned xy_length)
//   {
//     const unsigned int inputs = self->get_n();
//     const unsigned int outputs = self->get_m();

//     vector<vector<double>> x(xy_length, vector<double>(inputs));
//     vector<vector<double>> yt(xy_length, vector<double>(outputs));

//     fill_vector_grid<double>(x, yt, x_array, yt_array);

//     std::function<double(void)> get_fitness = [&self, &x, &yt]() -> double { return self->loss(x, yt, "MSE"); };

//     double best_fitness = mu_plus_lambda<double>(self, mu, lambda, get_fitness);

//     return best_fitness;
//   };
// }
