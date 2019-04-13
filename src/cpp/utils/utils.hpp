#include <vector>
#include <string>
#include <dcgp/expression.hpp>
#include <dcgp/kernel.hpp>
#include <dcgp/kernel_set.hpp>

using namespace dcgp;

template <typename T>
T *array_to_heap(const T *const array, const unsigned &length)
{
  T *ret = new T[length];

  memcpy(ret, &array[0], length * sizeof(T));

  return ret;
}

void fill_strings_vector(
    std::vector<std::string> &dst,
    const char *const src,
    const unsigned &length);

template <typename T, typename C>
expression<C> *convert_expression_type(
    const expression<T> *const current,
    const unsigned &seed)
{
  const std::vector<kernel<T>> kernels = current->get_f();

  std::vector<std::string> kernel_names;
  kernel_names.reserve(kernels.size());

  for (size_t i = 0; i < kernels.size(); i++)
  {
    std::string kernel_name = kernels[i].get_name();

    // transform protected division to regular division because
    // the gdual types do not support protected division.
    if (kernel_name == "pdiv")
      kernel_names.push_back("div");

    else
      kernel_names.push_back(kernel_name);
  }

  kernel_set<C> converted_kernel_set(kernel_names);

  expression<C> *converted = new expression<C>(
      current->get_n(),
      current->get_m(),
      current->get_r(),
      current->get_c(),
      current->get_l(),
      current->get_arity(),
      converted_kernel_set.operator()(),
      seed);

  converted->set(current->get());

  return converted;
}

template <typename T>
void fill_vector_grid(
    std::vector<std::vector<T>> &x_dest,
    std::vector<std::vector<T>> &yt_dest,
    const double *const &x_src,
    const double *const &yt_src,
    const unsigned &xy_length,
    const unsigned &num_inputs,
    const unsigned &num_outputs,
    const double *const &constants,
    const unsigned &constants_length)
{
  const unsigned inputs_length = num_inputs - constants_length;

  for (size_t i = 0; i < xy_length; i++)
  {
    for (size_t j = 0; j < num_inputs; j++)
    {
      if (j >= inputs_length)
        x_dest[i][j] = T(constants[j - inputs_length]);

      else
        x_dest[i][j] = T(x_src[j * xy_length + i]);
    }

    for (size_t j = 0; j < num_outputs; j++)
      yt_dest[i][j] = T(yt_src[j * xy_length + i]);
  }
}
