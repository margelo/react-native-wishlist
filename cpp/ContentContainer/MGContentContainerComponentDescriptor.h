#pragma once

#include <React-Fabric/react/renderer/components/view/ConcreteViewShadowNode.h>
#include <React-Fabric/react/renderer/core/ConcreteComponentDescriptor.h>
#include <iostream>
#include "MGContentContainerShadowNode.h"

namespace facebook {
namespace react {

class MGContentContainerComponentDescriptor
    : public ConcreteComponentDescriptor<MGContentContainerShadowNode> {
  using ConcreteComponentDescriptor::ConcreteComponentDescriptor;

  ShadowNode::Unshared cloneShadowNode(
      const ShadowNode &sourceShadowNode,
      const ShadowNodeFragment &fragment) const override {
    // React holds on to old shadow nodes so we need to make sure to get the
    // latest state when cloning those to get the children that were set by
    // Wishlist.
    auto &mostRecentStateData = static_cast<ConcreteState const *>(
                                    sourceShadowNode.getMostRecentState().get())
                                    ->getData();
    auto shadowNode = std::make_shared<MGContentContainerShadowNode>(
        sourceShadowNode,
        ShadowNodeFragment{
            fragment.props,
            mostRecentStateData.wishlistChildren
                ? mostRecentStateData.wishlistChildren
                : fragment.children,
            fragment.state});
          
    // adopt(shadowNode);
    return shadowNode;
  }
};

} // namespace react
} // namespace facebook
