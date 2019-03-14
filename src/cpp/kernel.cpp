#include <emscripten.h>
#include <vector>
#include <string>
#include <functional>

#include "dcgp/kernel.hpp"

using namespace dcgp;

extern "C"
{
  // empty constructor
  kernel<double> *EMSCRIPTEN_KEEPALIVE embind_kernel_0(double (*operator_func)(double *, int), void (*string_func)(char *, unsigned int *, unsigned int, char *), const char *const name_array, const unsigned int name_length)
  {
    std::string name_string(name_array, name_array + name_length);

    auto operation_wrapper = [&operator_func](std::vector<double> input_vector) {
      double *input_array = &input_vector[0];
      int input_length = input_vector.size();

      return operator_func(input_array, input_length);
    };

    auto string_wrapper = [&string_func](std::vector<std::string> input_vector) {
      unsigned int input_length = input_vector.size();

      char input_array[0];

      unsigned int lengths[input_length];

      for (size_t i = 0; i < input_length; ++i)
      {
        strcat(input_array, input_vector[i].c_str());
        lengths[i] = input_vector[i].length();
      }

      char result_array[3 + input_length * 5];

      string_func(input_array, lengths, input_length, result_array);

      std::string result = std::string(result_array);

      return result;
    };

    return new kernel<double>(operation_wrapper, string_wrapper, name_string);
  }

  // compute and return the result of this kernel
  double EMSCRIPTEN_KEEPALIVE embind_kernel_call_double(const kernel<double> *const self, const double *const input_numbers, unsigned int len)
  {
    std::vector<double> input_vector(input_numbers, input_numbers + len);

    double result = (*self)(input_vector);

    return result;
  }

  // set the equation in an array
  char *EMSCRIPTEN_KEEPALIVE embind_kernel_call_string(const kernel<double> *const self, const char *const input_chars, const unsigned int *const lengths, unsigned int len, unsigned int *const out_length)
  {
    std::vector<std::string> input_strings;
    input_strings.reserve(len);

    unsigned int shifted(0);

    for (size_t i = 0; i < len; i++)
    {
      const char *string_start = input_chars + shifted;
      const char *string_end = input_chars + shifted + lengths[i];

      input_strings.emplace_back(string_start, string_end);

      shifted += lengths[i];
      shifted++;
    }

    std::string tmp_result = (*self)(input_strings);
    *out_length = tmp_result.length();

    char *result = new char[tmp_result.length() + 1];
    strcpy(result, tmp_result.c_str());

    return result;
  }

  // set kernel name in array, return its pointer and set the length
  char *EMSCRIPTEN_KEEPALIVE embind_kernel_name(const kernel<double> *const self, unsigned int *const length)
  {
    std::string tmp_name = self->get_name();

    *length = tmp_name.length();

    char *name = new char[tmp_name.length() + 1];

    strcpy(name, tmp_name.c_str());

    return name;
  }

  // delete the kernel object from memory
  void EMSCRIPTEN_KEEPALIVE embind_kernel_destroy(const kernel<double> *const self)
  {
    delete self;
  }
}
