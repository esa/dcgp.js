#pragma once

#include <dcgp/expression.hpp>

using namespace dcgp;

// Wrapper class to keep track of the seed.
// For simplicity you only need to reference this class when the seed is involved.
// e.g. creation of the class and getting the seed.

template <typename T>
class custom_expression : public expression<T>
{
public:
  custom_expression(
      unsigned inputs,
      unsigned outputs,
      unsigned rows,
      unsigned columns,
      unsigned levels_back,
      std::vector<unsigned> arity,
      std::vector<kernel<T>> kernels,
      unsigned seed)
      : m_seed(seed),
        expression<T>(
            inputs,
            outputs,
            rows,
            columns,
            levels_back,
            arity,
            kernels,
            seed){

        };

  custom_expression(
      unsigned inputs,
      unsigned outputs,
      unsigned rows,
      unsigned columns,
      unsigned levels_back,
      unsigned arity,
      std::vector<kernel<T>> kernels,
      unsigned seed)
      : m_seed(seed),
        expression<T>(
            inputs,
            outputs,
            rows,
            columns,
            levels_back,
            arity,
            kernels,
            seed){

        };

  double get_seed() const
  {
    return m_seed;
  }

private:
  double m_seed;
};
