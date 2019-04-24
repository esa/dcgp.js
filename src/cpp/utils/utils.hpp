#include <vector>
#include <string>
#include <cmath>
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
    std::vector<std::vector<T>> &dest,
    const double *const &src,
    const unsigned &num_points,
    const unsigned &num_entries,
    const double *const &constants = nullptr,
    const unsigned &constants_length = 0)
{
  const unsigned const_offset = num_entries - constants_length;

  for (size_t i = 0; i < num_points; i++)
  {
    for (size_t j = 0; j < num_entries; j++)
    {
      if (j >= const_offset)
        dest[i][j] = T(constants[j - const_offset]);

      else
        dest[i][j] = T(src[j * num_points + i]);
    }
  }
}

double magnitude(const std::vector<double> &in);

void scale(std::vector<double> &in, const double &scalar);

void normalize(std::vector<double> &in);
