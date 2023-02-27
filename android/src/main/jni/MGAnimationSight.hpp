//
//  MGAnimationSight.hpp
//  MGWishList
//
//  Created by Szymon on 13/01/2023.
//

#ifndef MGAnimationSight_hpp
#define MGAnimationSight_hpp

#include <stdio.h>

struct MGAnimationSight {
  virtual float getOffsetIfItemIsAlreadyRendered(int index) = 0;
  virtual bool isTargetItemLocatedBelow(int targetItem) = 0;
  static float NOT_FOUND;
};

#endif /* MGItemSight_hpp */
