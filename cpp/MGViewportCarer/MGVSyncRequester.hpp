//
//  MGVSyncRequester.hpp
//  MGWishList
//
//  Created by Szymon on 13/01/2023.
//

#pragma once

#include <stdio.h>

namespace Wishlist {

struct MGVSyncRequester {
  virtual void requestVSync() = 0;
};

}; // namespace Wishlist
