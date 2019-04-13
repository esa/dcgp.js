#include <emscripten.h>
#include <dcgp/expression.hpp>

using namespace dcgp;

extern "C"
{
  void EMSCRIPTEN_KEEPALIVE expression_destroy(
      const expression<double> *const self)
  {
    delete self;
  }
}
