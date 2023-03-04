#include "WishlistManagerModule.hpp"

#include <fbjni/fbjni.h>
#include "MGUIManagerHolder.h"
#include "WishlistJsRuntime.h"

using namespace facebook::react;
using namespace facebook::jni;

namespace Wishlist {

local_ref<WishlistManagerModule::jhybriddata> WishlistManagerModule::initHybrid(
    alias_ref<jclass>) {
  return makeCxxInstance();
}

WishlistManagerModule::WishlistManagerModule() {}

WishlistManagerModule::~WishlistManagerModule() {
  scheduler_->removeEventListener(eventListener_);
}

void WishlistManagerModule::nativeInstall(
    jlong jsiRuntimeRef,
    alias_ref<CallInvokerHolder::javaobject> jsCallInvokerHolder,
    alias_ref<JFabricUIManager::javaobject> fabricUIManager) {
  auto jsiRuntime{reinterpret_cast<Runtime *>(jsiRuntimeRef)};
  auto const &jsCallInvoker = jsCallInvokerHolder->cthis()->getCallInvoker();
  scheduler_ = fabricUIManager->getBinding()->getScheduler();

  eventListener_ =
      std::make_shared<EventListener>([this](const RawEvent &event) -> bool {
        if (event.eventTarget == nullptr) {
          return false;
        }

        WishlistJsRuntime::getInstance().accessRuntime([this,
                                                        event](Runtime &rt) {
          try {
            auto handleEvent = rt.global()
                                   .getPropertyAsObject(rt, "global")
                                   .getPropertyAsFunction(rt, "handleEvent");
            handleEvent.call(
                rt,
                event.type,
                event.eventTarget->getTag(),
                event.payloadFactory(rt));
          } catch (std::exception &error) {
            errorHandler_->reportError(error.what());
          }
        });

        return true;
      });
  scheduler_->addEventListener(eventListener_);

  wishlistQueue_ = std::make_shared<RNWorklet::DispatchQueue>("wishlistqueue");

  WishlistJsRuntime::getInstance().initialize(
      jsiRuntime,
      [=](std::function<void()> &&f) {
        jsCallInvoker->invokeAsync(std::move(f));
      },
      [=](std::function<void()> &&f) {
        wishlistQueue_->dispatch(std::move(f));
      });

  MGUIManagerHolder::getInstance().setUIManager(scheduler_->getUIManager());
}

void WishlistManagerModule::registerNatives() {
  registerHybrid(
      {makeNativeMethod("initHybrid", WishlistManagerModule::initHybrid),
       makeNativeMethod(
           "nativeInstall", WishlistManagerModule::nativeInstall)});
}

} // namespace Wishlist
