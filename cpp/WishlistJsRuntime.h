#pragma once

#include <ReactCommon/CallInvoker.h>
#include <jsi/jsi.h>
#include <react-native-worklets/JsiBaseDecorator.h>
#include <react-native-worklets/JsiWorkletContext.h>
#include <stdio.h>
#include <memory>

using namespace facebook;

namespace Wishlist {

class WishlistJsRuntime {
 public:
  static WishlistJsRuntime &getInstance();

  void initialize(
      jsi::Runtime *runtime,
      std::function<void(std::function<void()> &&)> jsCallInvoker,
      std::function<void(std::function<void()> &&)> workletCallInvoker);

  jsi::Runtime &getRuntime() const;

 private:
  WishlistJsRuntime();
  WishlistJsRuntime(const WishlistJsRuntime &) = delete;
  WishlistJsRuntime &operator=(const WishlistJsRuntime &) = delete;

  class Decorator : public RNWorklet::JsiBaseDecorator {
    void decorateRuntime(jsi::Runtime &runtime) override;
  };

  std::shared_ptr<RNWorklet::JsiWorkletContext> workletContext_;
};

}; // namespace Wishlist
