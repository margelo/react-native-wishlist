#ifndef GlobalStateAdapter_hpp
#define GlobalStateAdapter_hpp

#include "GlobalState.h"
#include <fbjni/fbjni.h>
using namespace facebook::jni;

struct GlobalStateAdapter : public JavaClass<GlobalStateAdapter> {
  static constexpr auto kJavaDescriptor = "Lcom/margelo/wishlist/GlobalStateAdapter;";
  static void registerNatives() {
      javaClassStatic()->registerNatives({
        makeNativeMethod("printTag", GlobalStateAdapter::printTag)
      });
  }

  static void printTag(alias_ref<JClass> clazz, jint tag) {
    GlobalState::printAnythingMethod(tag);
  }

};
#endif /* GlobalStateAdapter_hpp */
