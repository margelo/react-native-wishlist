#pragma once

#include <fbjni/fbjni.h>
#include "MGUIScheduler.hpp"

namespace Wishlist {

using namespace facebook::jni;

class UISchedulerAndroid final : public JavaClass<UISchedulerAndroid>,
                                 public MGUIScheduler {
 public:
  static auto constexpr kJavaDescriptor = "Lcom/wishlist/UIScheduler;";

  void scheduleOnUI(std::function<void()> &&f) override;
};

}; // namespace Wishlist
