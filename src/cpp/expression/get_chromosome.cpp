#include <emscripten.h>
#include <dcgp/expression.hpp>
// #include <dcgp/expression_weighted.hpp>
#include <dcgp/kernel_set.hpp>
// #include <audi/gdual.hpp>
// #include <audi/vectorized.hpp>

#include "../utils/utils.hpp"

using namespace dcgp;

// typedef audi::gdual<double> gdual_d;
// typedef audi::gdual<audi::vectorized<double>> gdual_v;

template <typename T>
unsigned *get_chromosome(const expression<T> *const self, unsigned *const length)
{
  const std::vector<unsigned> tmp_chromosome = self->get();

  *length = tmp_chromosome.size();

  unsigned *chromosome = array_to_heap<unsigned>(&tmp_chromosome[0], *length);

  return chromosome;
}

extern "C"
{
  unsigned *EMSCRIPTEN_KEEPALIVE expression_get_chromosome(
      const expression<double> *const self,
      unsigned *const length)
  {
    return get_chromosome<double>(self, length);
  }

  // unsigned *EMSCRIPTEN_KEEPALIVE expression_get_chromosome_gdual_d(
  //     const expression<gdual_d> *const self,
  //     unsigned *const length)
  // {
  //   return get_chromosome<gdual_d>(self, length);
  // }

  // unsigned *EMSCRIPTEN_KEEPALIVE expression_get_chromosome_gdual_v(
  //     const expression<gdual_v> *const self,
  //     unsigned *const length)
  // {
  //   return get_chromosome<gdual_v>(self, length);
  // }
}
