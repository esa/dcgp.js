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
    kernel_names.push_back(kernels[i].get_name());

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
