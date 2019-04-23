#include <emscripten.h>
#include "utils.hpp"

void fill_strings_vector(
    std::vector<std::string> &dst,
    const char *const src,
    const unsigned &length)
{
  dst.reserve(length);

  unsigned int shifted(0);

  for (size_t i = 0; i < length; i++)
  {
    const char *string_start = src + shifted;

    dst.emplace_back(string_start);

    shifted += dst[i].length() + 1;
  }
}

double magnitude(const std::vector<double> &in)
{
  double retval(0.0);

  for (size_t i = 0; i < in.size(); i++)
  {
    retval += std::pow(in[i], 2);
  }

  return std::sqrt(retval);
}

void scale(std::vector<double> &in, const double &scalar)
{
  for (size_t i = 0; i < in.size(); i++)
  {
    in[i] *= scalar;
  }
}

void normalize(std::vector<double> &in)
{
  double scalar = magnitude(in);

  if (scalar > 0) {
    scale(in, 1 / scalar);
  }
}

extern "C"
{
  void EMSCRIPTEN_KEEPALIVE delete_string(const char *const string)
  {
    delete[] string;
  }

  void EMSCRIPTEN_KEEPALIVE delete_double_array(const double *const arr)
  {
    delete[] arr;
  }

  void EMSCRIPTEN_KEEPALIVE delete_uint32_array(const unsigned int *const arr)
  {
    delete[] arr;
  }
}
