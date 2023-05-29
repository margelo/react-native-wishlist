//
//  MGUIScheduleriOS.cpp
//  CocoaAsyncSocket
//
//  Created by Szymon on 14/01/2023.
//

#import "MGUIScheduleriOS.hpp"
#import <React/RCTUtils.h>

namespace Wishlist {

void MGUIScheduleriOS::scheduleOnUI(std::function<void()> &&f)
{
  __block auto retainedWork = std::move(f);
  RCTExecuteOnMainQueue(^{
    retainedWork();
  });
};

}; // namespace Wishlist
