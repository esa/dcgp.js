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
