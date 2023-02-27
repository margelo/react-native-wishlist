#pragma once

#include "MGUIScheduler.hpp"

namespace Wishlist {

class MGUISchedulerAndroid final : public MGUIScheduler {
 public:
  virtual void scheduleOnUI(std::function<void()> &&f);
};

}; // namespace Wishlist
