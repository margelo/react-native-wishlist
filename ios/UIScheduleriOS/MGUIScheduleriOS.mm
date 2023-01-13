//
//  MGUIScheduleriOS.cpp
//  CocoaAsyncSocket
//
//  Created by Szymon on 14/01/2023.
//

#include "MGUIScheduleriOS.hpp"

void MGUIScheduleriOS::scheduleOnUI(std::function<void()> && f) {
    __block auto retainedWork = std::move(f);
    dispatch_sync(dispatch_get_main_queue(), ^{
        retainedWork();
    });
};
