//
//  MGViewportCarerListener.hpp
//  MGWishList
//
//  Created by Szymon on 13/01/2023.
//

#pragma once

#include <stdio.h>
#include <string>

namespace Wishlist {

struct Item {
  float offset;
  float height;
  int index;
  std::string key;
};

struct MGViewportCarerListener {
  virtual void didPushChildren(std::vector<Item> newWindow) = 0;
};

}; // namespace Wishlist
