//
//  MGWindowKeeper.hpp
//  MGWishList
//
//  Created by Szymon on 13/01/2023.
//

#pragma once

#include <stdio.h>
#include <vector>
#include "MGAnimationSight.hpp"
#include "MGDIIOS.h"
#include "MGViewportCarerListener.hpp"

namespace Wishlist {

struct MGWindowKeeper final : MGAnimationSight, MGViewportCarerListener {
  std::vector<Item> items;
  std::weak_ptr<MGDIIOS> di;

  MGWindowKeeper(std::weak_ptr<MGDIIOS> _di);

#pragma mark MGViewportCarerListener

  void didPushChildren(std::vector<Item> newWindow) override;

#pragma mark MGAnimationSight

  float getOffsetIfItemIsAlreadyRendered(int index) override;
  bool isTargetItemLocatedBelow(int targetItem) override;
};

}; // namespace Wishlist
