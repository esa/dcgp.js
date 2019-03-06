#include <emscripten.h>
// #include <vector>
// #include <iostream>
// #include <string>

#include "dcgp/expression.hpp"
#include "dcgp/kernel_set.hpp"


using namespace dcgp;

// expression.cpp
extern "C"
{
  // empty constructor
  expression<double> *EMSCRIPTEN_KEEPALIVE embind_expression_0(const unsigned int inputs, const unsigned int outputs, const unsigned int rows, const unsigned int columns, const unsigned int levels_back, const unsigned int arity, const kernel_set<double> *const kernels, const double seed)
  {
    return new expression<double>(inputs, outputs, rows, columns, levels_back, arity, (*kernels)(), seed);
  }

  // get chromosome
  unsigned int *EMSCRIPTEN_KEEPALIVE embind_expression_get(const expression<double> *const self, unsigned int *const length)
  {
    const std::vector<unsigned int> tmp_chromosome = self->get();

    *length = tmp_chromosome.size();

    unsigned int *chromosome = new unsigned int[tmp_chromosome.size()];

    for (size_t i = 0; i < tmp_chromosome.size(); i++)
    {
      chromosome[i] = tmp_chromosome[i];
    }

    return chromosome;
  }

  // set chromosome
  void EMSCRIPTEN_KEEPALIVE embind_expression_set(expression<double> *const self, const unsigned int *const chromosome, const unsigned int length)
  {
    std::vector<unsigned int> chromosome_vect(chromosome, chromosome + length);

    self->set(chromosome_vect);
  }

  // destroy
  void EMSCRIPTEN_KEEPALIVE embind_expression_destroy(const expression<double> *const self)
  {
    delete self;
  }
}
