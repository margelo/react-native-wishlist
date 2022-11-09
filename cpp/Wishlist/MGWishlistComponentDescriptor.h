
#pragma once

#include <react/renderer/core/ConcreteComponentDescriptor.h>
#include "MGWishlistShadowNode.h"

namespace facebook {
namespace react {

class MGWishlistComponentDescriptor
    : public ConcreteComponentDescriptor<MGWishlistShadowNode> {
 public:
  MGWishlistComponentDescriptor(ComponentDescriptorParameters const &parameters)
      : ConcreteComponentDescriptor(parameters) {}

  // TODO think about it
  virtual ShadowNode::Shared createShadowNode(
      const ShadowNodeFragment &fragment,
      ShadowNodeFamily::Shared const &family) const override {
    auto shadowNode = std::make_shared<MGWishlistShadowNode>(
        ShadowNodeFragment{fragment.props, nullptr, fragment.state},
        family,
        getTraits());
    shadowNode->sharedThis = shadowNode;

    adopt(shadowNode);

    return shadowNode;
  }

  // TODO fix this
  virtual ShadowNode::Unshared cloneShadowNode(
      const ShadowNode &sourceShadowNode,
      const ShadowNodeFragment &fragment) const override {
    ShadowNode::Unshared shadowNode(nullptr);
    if (ViewportObserver::isPushingChildren) {
      shadowNode =
          std::make_shared<MGWishlistShadowNode>(sourceShadowNode, fragment);
    } else {
      shadowNode = std::make_shared<MGWishlistShadowNode>(
          sourceShadowNode, ShadowNodeFragment{});
    }

    std::shared_ptr<MGWishlistShadowNode> wishlistShadowNode =
        std::static_pointer_cast<MGWishlistShadowNode>(shadowNode);
    /*MGWishlistShadowNode->registeredViews = static_cast<const
     * MGWishlistShadowNode&>(sourceShadowNode).registeredViews;*/
    wishlistShadowNode->sharedThis = wishlistShadowNode;

    adopt(shadowNode);
    return shadowNode;
  }

  virtual ~MGWishlistComponentDescriptor() {}
};

} // namespace react
} // namespace facebook
