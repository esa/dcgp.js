#include <vector>
#include <string>

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
