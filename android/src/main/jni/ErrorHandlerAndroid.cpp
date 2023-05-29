#include "ErrorHandlerAndroid.h"

#include <fbjni/fbjni.h>
#include <react/jni/JReactCxxErrorHandler.h>

namespace Wishlist {

using namespace facebook;

void ErrorHandlerAndroid::reportError(const std::string &message) {
  // TODO: Our thread should have access to JVM by default.
  jni::ThreadScope::WithClassLoader(
      [&] { react::JReactCxxErrorHandler::handleError(message); });
}

}; // namespace Wishlist
