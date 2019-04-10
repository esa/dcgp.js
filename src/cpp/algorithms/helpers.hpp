#include <vector>

using std::vector;

template <typename T>
void fill_vector_grid(
    vector<vector<T>> &x_dest,
    vector<vector<T>> &yt_dest,
    const double *const &x_src,
    const double *const &yt_src,
    const unsigned &xy_length,
    const unsigned &num_inputs,
    const unsigned &num_outputs,
    vector<T> &constants)
{
  const unsigned inputs_length = num_inputs - constants.size();

  for (size_t i = 0; i < xy_length; i++)
  {
    for (size_t j = 0; j < num_inputs; j++)
    {
      if (j >= inputs_length)
      {
        x_dest[i][j] = constants[j - inputs_length];
      }
      else
      {
        x_dest[i][j] = T(x_src[i * inputs_length + j]);
      }
    }

    for (size_t j = 0; j < num_outputs; j++)
    {
      yt_dest[i][j] = T(yt_src[i * num_outputs + j]);
    }
  }
}
