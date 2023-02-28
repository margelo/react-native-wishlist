//
//  MGWindowKeeper.cpp
//  MGWishList
//
//  Created by Szymon on 13/01/2023.
//

#include "MGWindowKeeper.hpp"

namespace Wishlist {

MGWindowKeeper::MGWindowKeeper(std::weak_ptr<MGDI> _di) : di(_di) {}

float MGWindowKeeper::getOffsetIfItemIsAlreadyRendered(int index) {
  for (auto &item : this->items) {
    if (item.index == index) {
      return item.offset;
    }
  }
  return NOT_FOUND;
}

bool MGWindowKeeper::isTargetItemLocatedBelow(int targetItem) {
  return this->items.back().index < targetItem;
}

void MGWindowKeeper::didPushChildren(std::vector<Item> newWindow) {
  this->items = newWindow;
  std::shared_ptr<MGDI> retainedDI = di.lock();
  if (retainedDI != nullptr && newWindow.size() > 0) {
    float topEdge = newWindow[0].offset;
    float bottomEdge = newWindow.back().offset + newWindow.back().height;
    retainedDI->getBoundingBoxObserver()->boundingBoxDidChange(
        {topEdge, bottomEdge});
  }
}

}; // namespace Wishlist
