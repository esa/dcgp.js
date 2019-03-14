#include <emscripten.h>

extern "C"
{

  void EMSCRIPTEN_KEEPALIVE embind_delete_string(const char * const string)
  {
    delete[] string;
  }

  void EMSCRIPTEN_KEEPALIVE embind_delete_double_array(const double * const arr)
  {
    delete[] arr;
  }

  void EMSCRIPTEN_KEEPALIVE embind_delete_uint32_array(const unsigned int * const arr)
  {
    delete[] arr;
  }

}
