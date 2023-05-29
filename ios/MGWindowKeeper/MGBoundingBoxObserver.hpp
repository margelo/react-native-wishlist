//
//  MGBoundingBoxObserver.hpp
//  MGWishList
//
//  Created by Szymon on 13/01/2023.
//

#pragma once

#include <stdio.h>
#include <vector>

namespace Wishlist {

struct MGBoundingBoxObserver {
  virtual void boundingBoxDidChange(
      std::pair<float, float> TopAndBottomEdge) = 0;
};

}; // namespace Wishlist
