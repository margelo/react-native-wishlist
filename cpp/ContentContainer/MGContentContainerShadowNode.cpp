#include "MGContentContainerShadowNode.h"
#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/components/wishlist/Props.h>
#include <react/renderer/core/ComponentDescriptor.h>

namespace facebook {
namespace react {

extern const char MGContentContainerComponentName[] = "MGContentContainer";

void MGContentContainerShadowNode::setWishlistChildren(
    const ShadowNode::SharedListOfShared &wishlistChildren) {
  auto state = getStateData();
  if (state.wishlistChildren != wishlistChildren) {
    state.wishlistChildren = wishlistChildren;
    setStateData(std::move(state));
  }
}

} // namespace react
} // namespace facebook
