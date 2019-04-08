// #include <emscripten.h>
// #include <vector>
// #include <string>
// #include <functional>

// #include "dcgp/kernel.hpp"

// using namespace dcgp;

// extern "C"
// {
//   // empty constructor
//   kernel<double> *EMSCRIPTEN_KEEPALIVE embind_kernel_0(double (*operator_func)(double *, int), void (*string_func)(char *, unsigned int *, unsigned int, char *), const char *const name_array, const unsigned int name_length)
//   {
//     std::string name_string(name_array, name_array + name_length);

//     auto operation_wrapper = [&operator_func](std::vector<double> input_vector) {
//       double *input_array = &input_vector[0];
//       int input_length = input_vector.size();

//       return operator_func(input_array, input_length);
//     };

//     auto string_wrapper = [&string_func](std::vector<std::string> input_vector) {
//       unsigned int input_length = input_vector.size();

//       char input_array[0];

//       unsigned int lengths[input_length];

//       for (size_t i = 0; i < input_length; ++i)
//       {
//         strcat(input_array, input_vector[i].c_str());
//         lengths[i] = input_vector[i].length();
//       }

//       char result_array[3 + input_length * 5];

//       string_func(input_array, lengths, input_length, result_array);

//       std::string result = std::string(result_array);

//       return result;
//     };

//     return new kernel<double>(operation_wrapper, string_wrapper, name_string);
//   }
// }
