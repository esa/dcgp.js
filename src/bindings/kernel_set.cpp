#include <emscripten.h>
#include <vector>
#include <iostream>
#include <string>

#include "dcgp/kernel_set.hpp"
#include "dcgp/kernel.hpp"
#include "dcgp/expression.hpp"

using namespace dcgp;

extern "C"
{
  // empty constructor
  kernel_set<double> *EMSCRIPTEN_KEEPALIVE embind_kernel_set_0()
  {
    return new kernel_set<double>();
  }

  // vector constructor
  kernel_set<double> *EMSCRIPTEN_KEEPALIVE embind_kernel_set_1(char *names, unsigned short int *lengths, unsigned short int len)
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
    }

    return new kernel_set<double>(kernel_names);
  }

  // add kernel based on name
  void EMSCRIPTEN_KEEPALIVE embind_kernel_set_push_back_0(kernel_set<double>* const self, const char* const name, unsigned short int len)
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
  kernel<double> *EMSCRIPTEN_KEEPALIVE embind_kernel_set_index(kernel_set<double>* const self, unsigned short int index)
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

  // print the kernels
  void EMSCRIPTEN_KEEPALIVE embind_kernel_set_print(kernel_set<double>* const self)
  {
    std::cout << *self << '\n';
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

// expression.cpp
extern "C"
{
  // empty constructor
  expression<double> *EMSCRIPTEN_KEEPALIVE embind_expression_0(const unsigned int inputs, const unsigned int outputs, const unsigned int rows, const unsigned int columns, const unsigned int levels_back, const unsigned int arity, const kernel_set<double> *const kernels, const double seed)
  {
    return new expression<double>(inputs, outputs, rows, columns, levels_back, arity, (*kernels)(), seed);
  }

  // get chromosome
  unsigned int* EMSCRIPTEN_KEEPALIVE embind_expression_get(const expression<double> * const self, unsigned int * const length)
  {
    const std::vector<unsigned int> tmp_chromosome = self->get();

    *length = tmp_chromosome.size();

    unsigned int* chromosome = new unsigned int[tmp_chromosome.size()];

    for(size_t i = 0; i < tmp_chromosome.size(); i++)
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
