#include "JNIStateRegistry.h"

namespace Wishlist {

JNIStateRegistry &JNIStateRegistry::getInstance() {
  static JNIStateRegistry instance;
  return instance;
}

JNIStateRegistry::JNIStateRegistry() : idGenerator_(0) {}

void *JNIStateRegistry::getValue(int id) {
  return values_[id];
}

int JNIStateRegistry::addValue(void *value) {
  int id = idGenerator_++;
  values_[id] = value;
  return id;
}

}; // namespace Wishlist
