//
//  MGAnimationSight.hpp
//  MGWishList
//
//  Created by Szymon on 13/01/2023.
//

#pragma once

#include <stdio.h>

namespace Wishlist {

struct MGAnimationSight {
  virtual float getOffsetIfItemIsAlreadyRendered(int index) = 0;
  virtual bool isTargetItemLocatedBelow(int targetItem) = 0;
  static float NOT_FOUND;
};

}; // namespace Wishlist
