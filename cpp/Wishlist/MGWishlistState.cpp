#include "MGWishlistState.h"

#ifdef ANDROID
#include "JNIStateRegistry.h"
#endif

namespace facebook {
namespace react {

MGWishlistState::MGWishlistState()
    : initialised(false),
      viewportCarer(std::make_shared<MGViewportCarerImpl>()),
      contentBoundingRect({}){};

#ifdef ANDROID

MGWishlistState::MGWishlistState(
    MGWishlistState const &previousState,
    folly::dynamic data)
    : initialised(previousState.initialised),
      viewportCarer(previousState.viewportCarer),
      contentBoundingRect(previousState.contentBoundingRect){};

folly::dynamic MGWishlistState::getDynamic() const {
  auto viewportCarerRef = Wishlist::JNIStateRegistry::getInstance().addValue(
      (void *)&viewportCarer);
  return folly::dynamic::object("viewportCarer", viewportCarerRef);
};

MapBuffer MGWishlistState::getMapBuffer() const {
  return MapBufferBuilder::EMPTY();
};

#endif

} // namespace react
} // namespace facebook
