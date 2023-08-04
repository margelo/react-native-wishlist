//
//  MGViewportCarerListener.hpp
//  MGWishList
//
//  Created by Szymon on 13/01/2023.
//

#pragma once

#include <stdio.h>
#include <string>
#include "MGViewportCarer.hpp"

namespace Wishlist {

struct Item {
  float offset;
  float height;
  int index;
  std::string key;
  
  bool operator ==(const Item &item) const
  {
    return offset == item.offset && height == item.height && index == item.index && key == item.key;
  }
};

struct MGViewportCarerListener {
  virtual void didPushChildren(std::vector<Item> newWindow) = 0;
  virtual void didChangeContentSize(
      MGDims contentSize,
      float contentOffset) = 0;
};

}; // namespace Wishlist
