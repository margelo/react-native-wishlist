#include "MGWishlistState.h"

namespace facebook {
namespace react {

MGWishlistState::~MGWishlistState() {}

#ifdef ANDROID

MGWishlistState::MGWishlistState() {
  this->viewportObserver = std::make_shared<ViewportObserver>();
};

MGWishlistState::MGWishlistState(
    MGWishlistState const &previousState,
    folly::dynamic data){};

folly::dynamic MGWishlistState::getDynamic() const {
  return folly::dynamic::object("contentOffsetLeft", 5);
};

MapBuffer MGWishlistState::getMapBuffer() const {
  return MapBufferBuilder::EMPTY();
};

#endif

} // namespace react
} // namespace facebook
