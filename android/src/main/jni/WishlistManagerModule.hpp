#pragma once

#include <ReactCommon/CallInvokerHolder.h>
#include <fbjni/fbjni.h>
#include <react-native-worklets/WKTDispatchQueue.h>
#include <react/fabric/JFabricUIManager.h>
#include <react/renderer/core/EventListener.h>
#include <react/renderer/scheduler/Scheduler.h>
#include "ErrorHandlerAndroid.h"

using namespace facebook::react;
using namespace facebook::jni;

namespace Wishlist {

class WishlistManagerModule : public HybridClass<WishlistManagerModule> {
 public:
  WishlistManagerModule();
  ~WishlistManagerModule();

  static constexpr auto kJavaDescriptor =
      "Lcom/wishlist/WishlistManagerModule;";

  static void registerNatives();

 private:
  static local_ref<jhybriddata> initHybrid(alias_ref<jclass>);

  void nativeInstall(
      jlong jsiRuntimeRef,
      alias_ref<CallInvokerHolder::javaobject> jsCallInvokerHolder,
      alias_ref<JFabricUIManager::javaobject> fabricUIManager);

 private:
  friend HybridBase;

  std::shared_ptr<RNWorklet::DispatchQueue> wishlistQueue_;
  std::shared_ptr<Scheduler> scheduler_;
  std::shared_ptr<EventListener> eventListener_;
  std::shared_ptr<ErrorHandlerAndroid> errorHandler_;
};

} // namespace Wishlist
