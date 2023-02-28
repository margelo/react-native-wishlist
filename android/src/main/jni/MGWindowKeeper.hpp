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
#include "MGDI.hpp"
#include "MGPushChildrenListener.hpp"

namespace Wishlist {

struct MGWindowKeeper final : MGAnimationSight, MGPushChildrenListener {
  std::vector<Item> items;
  std::weak_ptr<MGDI> di;

  MGWindowKeeper(std::weak_ptr<MGDI> _di);

#pragma mark MGAnimationSight

  float getOffsetIfItemIsAlreadyRendered(int index) override;
  bool isTargetItemLocatedBelow(int targetItem) override;

#pragma mark MGPushChildrenListener

  void didPushChildren(std::vector<Item> newWindow) override;
};

}; // namespace Wishlist
