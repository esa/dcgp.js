#include <emscripten.h>

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
