#include <emscripten.h>
#include <dcgp/expression.hpp>
#include <vector>

#include "../utils/utils.hpp"

using namespace dcgp;
using std::vector;

extern "C"
{
  double EMSCRIPTEN_KEEPALIVE expression_loss(
      expression<double> *const self,
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

    double loss = self->loss(x, yt, "MSE");

    return loss;
  }
}
