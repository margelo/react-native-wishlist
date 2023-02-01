//
//  MGUIScheduleriOS.cpp
//  CocoaAsyncSocket
//
//  Created by Szymon on 14/01/2023.
//

#include "MGUIScheduleriOS.hpp"
#include <React/RCTUtils.h>

void MGUIScheduleriOS::scheduleOnUI(std::function<void()> &&f)
{
  __block auto retainedWork = std::move(f);
  RCTExecuteOnMainQueue(^{
    retainedWork();
  });
};
