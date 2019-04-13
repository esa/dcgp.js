#include <emscripten.h>
#include <dcgp/expression.hpp>
#include <dcgp/kernel_set.hpp>

#include "../utils/utils.hpp"

using namespace dcgp;

extern "C"
{
  unsigned *EMSCRIPTEN_KEEPALIVE expression_get_chromosome(
      const expression<double> *const self,
      unsigned *const length)
  {
    const std::vector<unsigned> tmp_chromosome = self->get();

    *length = tmp_chromosome.size();

    unsigned *chromosome = array_to_heap<unsigned>(&tmp_chromosome[0], *length);

    return chromosome;
  }
}
