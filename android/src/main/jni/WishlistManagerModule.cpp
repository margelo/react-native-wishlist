/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "WishlistManagerModule.hpp"

#include <fbjni/fbjni.h>
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
    jni::alias_ref<react::CallInvokerHolder::javaobject> jsCallInvokerHolder) {
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
}

void WishlistManagerModule::registerNatives() {
  registerHybrid(
      {makeNativeMethod("initHybrid", WishlistManagerModule::initHybrid),
       makeNativeMethod(
           "nativeInstall", WishlistManagerModule::nativeInstall)});
}

} // namespace Wishlist
