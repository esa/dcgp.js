#include <emscripten.h>
#include <dcgp/kernel.hpp>
#include <string>

using namespace dcgp;

extern "C"
{
  char *EMSCRIPTEN_KEEPALIVE kernel_name(const kernel<double> *const self)
  {
    std::string tmp_name = self->get_name();

    char *name = new char[tmp_name.length() + 1];

    strcpy(name, tmp_name.c_str());

    return name;
  }
}
