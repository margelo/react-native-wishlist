#include <fbjni/fbjni.h>
#include "Orchestrator.hpp"
#include "WishlistManagerModule.hpp"

using namespace Wishlist;

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *) {
  return facebook::jni::initialize(vm, [] {
    WishlistManagerModule::registerNatives();
    Orchestrator::registerNatives();
  });
}
