#pragma once

#include <vector>
#include <dcgp/expression.hpp>
#include <audi/gdual.hpp>
#include <audi/vectorized.hpp>

typedef audi::gdual<audi::vectorized<double>> gdual_v;

double calc_derivative(const gdual_v &, const unsigned &);

double calc_loss(
    const dcgp::expression<gdual_v> *const &,
    const std::vector<gdual_v> &,
    const std::vector<gdual_v> &,
    gdual_v &);

double gradient_descent(
    const dcgp::expression<gdual_v> *const,
    const unsigned &,
    std::vector<gdual_v> &,
    const std::vector<gdual_v> &,
    const unsigned &);
