//
//  ReanimatedRuntimeHandler.hpp
//  MGWishList
//
//  Created by Szymon on 15/12/2021.
//

#ifndef ReanimatedRuntimeHandler_hpp
#define ReanimatedRuntimeHandler_hpp

#include <stdio.h>
#include <jsi/jsi.h>
#include <memory>
#include <RNReanimated/Scheduler.h>

using namespace facebook;

struct ReanimatedRuntimeHandler {
    static std::shared_ptr<jsi::Runtime> rtPtr;
    static std::shared_ptr<reanimated::Scheduler> scheduler;
};

#endif /* ReanimatedRuntimeHandler_hpp */
