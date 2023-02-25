#pragma once

#include <ReactCommon/CallInvokerHolder.h>
#include <fbjni/fbjni.h>
#include <react-native-worklets/WKTDispatchQueue.h>

using namespace facebook;

namespace Wishlist {

class WishlistManagerModule : public jni::HybridClass<WishlistManagerModule> {
 public:
  WishlistManagerModule();

  static constexpr auto kJavaDescriptor =
      "Lcom/wishlist/WishlistManagerModule;";

  static void registerNatives();

 private:
  static jni::local_ref<jhybriddata> initHybrid(jni::alias_ref<jclass>);

  void nativeInstall(
      jlong jsiRuntimeRef,
      jni::alias_ref<react::CallInvokerHolder::javaobject> jsCallInvokerHolder);

 private:
  friend HybridBase;

  std::shared_ptr<RNWorklet::DispatchQueue> _wishlistQueue;
};

} // namespace Wishlist
