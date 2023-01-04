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
    auto runtimePtr = data.find("runtimePtr");
    auto newOffset = data.find("newOffset");

    if (runtimePtr != data.items().end()) {
      double runtimeAddress = runtimePtr->second.asDouble();
      jsi::Runtime * reactRt = reinterpret_cast<jsi::Runtime *> (runtimeAddress);
      std::shared_ptr<UIManagerBinding> binding = UIManagerBinding::getBinding(rt);
      std::shared_ptr<UIManager> uiManager = binding->uiManager_;
      viewportObserver->setUIManager(uiManager);
    }

    if (newOffset != data.items().end()) {
      double offset = newOffset->second.asDouble();
      viewportObserver->reactToOffsetChange(scrollView.contentOffset.y)
    }
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
