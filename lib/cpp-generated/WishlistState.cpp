//
//  WishlistState.cpp
//  MGWishList
//
//  Created by Szymon on 27/11/2021.
//

#include "WishlistState.h"

namespace facebook {
namespace react {

WishlistState::~WishlistState() {}

#ifdef ANDROID

WishlistState::WishlistState() {
      this->viewportObserver = std::make_shared<ViewportObserver>();
  };

WishlistState::WishlistState(WishlistState const &previousState, folly::dynamic data) {
      this->viewportObserver =  previousState.viewportObserver;
  };

folly::dynamic WishlistState::getDynamic() const {
  return folly::dynamic::object("contentOffsetLeft", 5);
};

MapBuffer WishlistState::getMapBuffer() const {
  return MapBufferBuilder::EMPTY();
};
  
#endif

} // namespace react
} // namespace facebook
