#include "WishlistJsRuntime.h"

#include <react-native-worklets/JsiWorkletContext.h>
#include <iostream>

namespace Wishlist {

WishlistJsRuntime &WishlistJsRuntime::getInstance() {
  static WishlistJsRuntime instance;
  return instance;
}

WishlistJsRuntime::WishlistJsRuntime() : workletContext_(nullptr) {}

void WishlistJsRuntime::initialize(
    jsi::Runtime *runtime,
    std::function<void(std::function<void()> &&)> jsCallInvoker,
    std::function<void(std::function<void()> &&)> workletCallInvoker) {
  workletContext_ = std::make_shared<RNWorklet::JsiWorkletContext>();
  workletContext_->initialize("wishlist", runtime, workletCallInvoker, jsCallInvoker);
  workletContext_->addDecorator(std::make_shared<Decorator>());

  runtime->global().setProperty(
      *runtime,
      "__wishlistWorkletContext",
      jsi::Object::createFromHostObject(*runtime, workletContext_));
}

jsi::Runtime &WishlistJsRuntime::getRuntime() const {
  return workletContext_->getWorkletRuntime();
}

void WishlistJsRuntime::Decorator::decorateRuntime(jsi::Runtime &rt) {
  auto callback = [](jsi::Runtime &rt,
                     const jsi::Value &thisValue,
                     const jsi::Value *args,
                     size_t count) -> jsi::Value {
    const jsi::Value *value = &args[0];
    if (value->isString()) {
      std::cout << value->getString(rt).utf8(rt).c_str() << std::endl;
    } else if (value->isNumber()) {
      std::cout << value->getNumber() << std::endl;
    } else if (value->isUndefined()) {
      std::cout << "undefined" << std::endl;
    } else {
      std::cout << "unsupported value type" << std::endl;
    }
    return jsi::Value::undefined();
  };
  jsi::Value log = jsi::Function::createFromHostFunction(
      rt, jsi::PropNameID::forAscii(rt, "_log"), 1, callback);
  rt.global().setProperty(rt, "_log", log);

  auto chronoNow = [](jsi::Runtime &rt,
                      const jsi::Value &thisValue,
                      const jsi::Value *args,
                      size_t count) -> jsi::Value {
    double now = std::chrono::system_clock::now().time_since_epoch() /
        std::chrono::milliseconds(1);
    return jsi::Value(now);
  };

  rt.global().setProperty(
      rt,
      "_chronoNow",
      jsi::Function::createFromHostFunction(
          rt, jsi::PropNameID::forAscii(rt, "_chronoNow"), 0, chronoNow));
}

}; // namespace Wishlist
