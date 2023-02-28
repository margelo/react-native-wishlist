//
//  MGUIScheduleriOS.hpp
//  CocoaAsyncSocket
//
//  Created by Szymon on 14/01/2023.
//

#pragma once

#include <stdio.h>
#include "MGUIScheduler.hpp"

namespace Wishlist {

struct MGUIScheduleriOS : MGUIScheduler {
  virtual void scheduleOnUI(std::function<void()> &&f);
};

}; // namespace Wishlist
