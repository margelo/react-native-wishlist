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
#include "MGPushChildrenListener.hpp"

namespace Wishlist {

struct MGWindowKeeper final : MGAnimationSight, MGPushChildrenListener {
  std::vector<Item> items;
  std::weak_ptr<MGDIIOS> di;

  MGWindowKeeper(std::weak_ptr<MGDIIOS> _di);

#pragma mark MGAnimationSight

  float getOffsetIfItemIsAlreadyRendered(int index) override;
  bool isTargetItemLocatedBelow(int targetItem) override;

#pragma mark MGPushChildrenListener

  void didPushChildren(std::vector<Item> newWindow) override;
};

}; // namespace Wishlist
