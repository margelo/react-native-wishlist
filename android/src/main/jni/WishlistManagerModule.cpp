#include "WishlistManagerModule.hpp"

#include <fbjni/fbjni.h>
#include "MGUIManagerHolder.h"
#include "WishlistJsRuntime.h"

using namespace facebook;

namespace Wishlist {

jni::local_ref<WishlistManagerModule::jhybriddata>
WishlistManagerModule::initHybrid(jni::alias_ref<jclass>) {
  return makeCxxInstance();
}

WishlistManagerModule::WishlistManagerModule() {}

void WishlistManagerModule::nativeInstall(
    jlong jsiRuntimeRef,
    jni::alias_ref<react::CallInvokerHolder::javaobject> jsCallInvokerHolder,
    jni::alias_ref<react::JFabricUIManager::javaobject> fabricUIManager) {
  auto jsiRuntime{reinterpret_cast<jsi::Runtime *>(jsiRuntimeRef)};
  auto jsCallInvoker = jsCallInvokerHolder->cthis()->getCallInvoker();

  _wishlistQueue = std::make_shared<RNWorklet::DispatchQueue>("wishlistqueue");

  WishlistJsRuntime::getInstance().initialize(
      jsiRuntime,
      [=](std::function<void()> &&f) {
        jsCallInvoker->invokeAsync(std::move(f));
      },
      [=](std::function<void()> &&f) {
        _wishlistQueue->dispatch(std::move(f));
      });

  auto uiManager =
      fabricUIManager->getBinding()->getScheduler()->getUIManager();
  MGUIManagerHolder::getInstance().setUIManager(std::move(uiManager));
}

void WishlistManagerModule::registerNatives() {
  registerHybrid(
      {makeNativeMethod("initHybrid", WishlistManagerModule::initHybrid),
       makeNativeMethod(
           "nativeInstall", WishlistManagerModule::nativeInstall)});
}

} // namespace Wishlist
