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

using namespace facebook;

struct ReanimatedRuntimeHandler {
    static std::shared_ptr<jsi::Runtime> rtPtr;
};

#endif /* ReanimatedRuntimeHandler_hpp */
