#include "UISchedulerAndroid.h"

#include <fbjni/NativeRunnable.h>

namespace Wishlist {

using namespace facebook::jni;

void UISchedulerAndroid::scheduleOnUI(std::function<void()> &&f) {
  // TODO: Our thread should have access to JVM by default.
  ThreadScope::WithClassLoader([&] {
    static const auto cls = javaClassStatic();
    static const auto method =
        cls->getStaticMethod<void(JRunnable::javaobject)>("scheduleOnUI");
    auto jrunnable = JNativeRunnable::newObjectCxxArgs(std::move(f));
    method(cls, jrunnable.get());
  });
}

}; // namespace Wishlist
