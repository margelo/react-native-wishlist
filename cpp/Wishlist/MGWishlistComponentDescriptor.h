
#pragma once

#include <react/renderer/core/ConcreteComponentDescriptor.h>
#include "MGWishlistShadowNode.h"

namespace facebook {
namespace react {

class MGWishlistComponentDescriptor
    : public ConcreteComponentDescriptor<MGWishlistShadowNode> {
  using ConcreteComponentDescriptor::ConcreteComponentDescriptor;

  ShadowNode::Unshared cloneShadowNode(
      const ShadowNode &sourceShadowNode,
      const ShadowNodeFragment &fragment) const override {
    auto &wishlistSourceShadowNode =
        static_cast<const MGWishlistShadowNode &>(sourceShadowNode);

    // When we clone this shadow node we need to make sure to use the
    // latest children of the viewport observer, otherwise react might
    // set the children back to what was rendered.
    auto wishlistChildren =
        wishlistSourceShadowNode.getStateData().viewportCarer->wishlistChildren;

    auto shadowNode = std::make_shared<MGWishlistShadowNode>(
        sourceShadowNode,
        ShadowNodeFragment{
            fragment.props,
            wishlistChildren ? wishlistChildren : fragment.children,
            fragment.state});

    adopt(shadowNode);
    return shadowNode;
  }
};

} // namespace react
} // namespace facebook
