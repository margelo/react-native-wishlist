#include <fbjni/fbjni.h>
#include "WishlistManagerModule.hpp"

using namespace Wishlist;

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *) {
  return facebook::jni::initialize(vm, [] {
    WishlistManagerModule::registerNatives();
  });
}
