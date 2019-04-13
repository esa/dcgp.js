#include <emscripten.h>
#include <dcgp/expression.hpp>

#include "../utils/utils.hpp"

using namespace dcgp;

extern "C"
{
  void EMSCRIPTEN_KEEPALIVE expression_set_chromosome(
      expression<double> *const self,
      const unsigned *const chromosome,
      const unsigned length)
  {
    std::vector<unsigned> chromosome_vector(chromosome, chromosome + length);

    self->set(chromosome_vector);
  }
}
