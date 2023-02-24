#pragma once

#include <ReactCommon/CallInvokerHolder.h>
#include <fbjni/fbjni.h>
#include <react-native-worklets/DispatchQueue.h>
#include <react/fabric/JFabricUIManager.h>

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
      jni::alias_ref<react::CallInvokerHolder::javaobject> jsCallInvokerHolder,
      jni::alias_ref<react::JFabricUIManager::javaobject> fabricUIManager);

 private:
  friend HybridBase;

  std::shared_ptr<RNWorklet::DispatchQueue> _wishlistQueue;
};

} // namespace Wishlist
