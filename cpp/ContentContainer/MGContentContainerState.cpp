#include "MGContentContainerState.h"

namespace facebook {
namespace react {

MGContentContainerState::MGContentContainerState()
    : wishlistChildren(nullptr){};

MGContentContainerState::MGContentContainerState(
    const ShadowNode::SharedListOfShared &wishlistChildren)
    : wishlistChildren(wishlistChildren) {}

#ifdef ANDROID

MGContentContainerState::MGContentContainerState(
    MGContentContainerState const &previousState,
    folly::dynamic data)
    : wishlistChildren(previousState.wishlistChildren){};

folly::dynamic MGContentContainerState::getDynamic() const {
  return folly::dynamic::object;
};

MapBuffer MGContentContainerState::getMapBuffer() const {
  return MapBufferBuilder::EMPTY();
};

#endif

} // namespace react
} // namespace facebook
