#include <emscripten.h>
#include <dcgp/expression.hpp>
#include <dcgp/expression_weighted.hpp>
#include <dcgp/kernel_set.hpp>
#include <audi/gdual.hpp>
#include <audi/vectorized.hpp>

#include "../utils/utils.hpp"

using namespace dcgp;

typedef audi::gdual<double> gdual_d;
typedef audi::gdual<audi::vectorized<double>> gdual_v;

template <typename T>
void set_chromosome(
    expression<T> *const self,
    const unsigned *const chromosome,
    const unsigned &length)
{
  std::vector<unsigned> chromosome_vector(chromosome, chromosome + length);

  self->set(chromosome_vector);
}

extern "C"
{
  void EMSCRIPTEN_KEEPALIVE expression_set_chromosome(
      expression<double> *const self,
      const unsigned *const chromosome,
      const unsigned length)
  {
    set_chromosome<double>(self, chromosome, length);
  }

  void EMSCRIPTEN_KEEPALIVE expression_set_chromosome_gdual_d(
      expression<gdual_d> *const self,
      const unsigned *const chromosome,
      const unsigned length)
  {
    set_chromosome<gdual_d>(self, chromosome, length);
  }

  void EMSCRIPTEN_KEEPALIVE expression_set_chromosome_gdual_v(
      expression<gdual_v> *const self,
      const unsigned *const chromosome,
      const unsigned length)
  {
    set_chromosome<gdual_v>(self, chromosome, length);
  }
}
