#pragma once

#include <jsi/jsi.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/components/wishlist/Props.h>
#include "MGContentContainerState.h"

namespace facebook {
namespace react {

JSI_EXPORT extern const char MGContentContainerComponentName[];

/*
 * `ShadowNode` for <MGContentContainer> component.
 */
class JSI_EXPORT MGContentContainerShadowNode final
    : public ConcreteViewShadowNode<
          MGContentContainerComponentName,
          MGContentContainerProps,
          ViewEventEmitter,
          MGContentContainerState> {
  using ConcreteViewShadowNode::ConcreteViewShadowNode;

 public:
  void setWishlistChildren(
      const ShadowNode::SharedListOfShared &wishlistChildren);
};

} // namespace react
} // namespace facebook
