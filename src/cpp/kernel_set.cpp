#include <emscripten.h>
#include <vector>
#include <string>

#include "dcgp/kernel_set.hpp"
#include "dcgp/kernel.hpp"

using namespace dcgp;

extern "C"
{
  // empty constructor
  kernel_set<double> *EMSCRIPTEN_KEEPALIVE embind_kernel_set_0()
  {
    return new kernel_set<double>();
  }

  // vector constructor
  kernel_set<double> *EMSCRIPTEN_KEEPALIVE embind_kernel_set_1(char *names, unsigned int *lengths, unsigned int len)
  {
    std::vector<std::string> kernel_names;
    kernel_names.reserve(len);

    unsigned int shifted(0);

    for (size_t i = 0; i < len; i++)
    {
      char* string_start = names + shifted;
      char* string_end = names + shifted + lengths[i];

      kernel_names.emplace_back(string_start, string_end);

      shifted += lengths[i];
      shifted++;
    }

    return new kernel_set<double>(kernel_names);
  }

  // add kernel based on name
  void EMSCRIPTEN_KEEPALIVE embind_kernel_set_push_back_0(kernel_set<double>* const self, const char* const name, unsigned int len)
  {
    std::string kernel_name(name, name + len);

    return self->push_back(kernel_name);
  }

  // add kernel
  void EMSCRIPTEN_KEEPALIVE embind_kernel_set_push_back_1(kernel_set<double>* const self, const kernel<double>* const kernel_object)
  {
    return self->push_back(*kernel_object);
  }

  // set the kernels in an array
  void EMSCRIPTEN_KEEPALIVE embind_kernel_set_call(kernel_set<double>* const self, const kernel<double>** const output_array)
  {
    std::vector<kernel<double>> kernels = (*self)();

    for (size_t i = 0; i < kernels.size(); i++)
    {
      kernel<double> tmp_kernel = kernels[i];
      kernel<double> *kernel_object = new kernel<double>(tmp_kernel);

      output_array[i] = kernel_object;
    }
  }

  // return pointer to kernel at index
  kernel<double> *EMSCRIPTEN_KEEPALIVE embind_kernel_set_index(kernel_set<double>* const self, unsigned int index)
  {
    kernel<double> tmp_kernel = (*self)[index];

    kernel<double> *kernel_object = new kernel<double>(tmp_kernel);

    return kernel_object;
  }

  // get the amount of kernels
  unsigned int EMSCRIPTEN_KEEPALIVE embind_kernel_set_length(const kernel_set<double>* const self)
  {
    std::vector<kernel<double>> kernels = (*self)();

    return kernels.size();
  }

  // remove all the kernels
  void EMSCRIPTEN_KEEPALIVE embind_kernel_set_clean(kernel_set<double>* const self)
  {
    self->clear();
  }

  // delete the kernel object from memory
  void EMSCRIPTEN_KEEPALIVE embind_kernel_set_destroy(const kernel_set<double>* const self)
  {
    delete self;
  }
}
