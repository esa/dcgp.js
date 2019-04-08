#include <emscripten.h>
#include <dcgp/kernel.hpp>
#include <audi/gdual.hpp>
#include <audi/vectorized.hpp>
#include <string>

using namespace dcgp;

typedef audi::gdual<double> gdual_d;
typedef audi::gdual<audi::vectorized<double>> gdual_v;

template <typename T>
char *name(const kernel<T> *const self)
{
  std::string tmp_name = self->get_name();

  char *name = new char[tmp_name.length() + 1];

  strcpy(name, tmp_name.c_str());

  return name;
}

extern "C"
{
  char *EMSCRIPTEN_KEEPALIVE kernel_name(const kernel<double> *const self)
  {
    return name<double>(self);
  }

  char *EMSCRIPTEN_KEEPALIVE kernel_name_gdual_d(const kernel<gdual_d> *const self)
  {
    return name<gdual_d>(self);
  }

  char *EMSCRIPTEN_KEEPALIVE kernel_name_gdual_v(const kernel<gdual_v> *const self)
  {
    return name<gdual_v>(self);
  }
}
