#pragma once

#include <jsi/jsi.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/components/wishlist/EventEmitters.h>
#include <react/renderer/components/wishlist/Props.h>
#include <react/renderer/core/LayoutContext.h>
#include "MGWishlistState.h"

namespace facebook {
namespace react {

JSI_EXPORT extern const char MGWishlistComponentName[];

/*
 * `ShadowNode` for <Wishlist> component.
 */
class JSI_EXPORT MGWishlistShadowNode
    : public ConcreteViewShadowNode<
          MGWishlistComponentName,
          MGWishlistProps,
          MGWishlistEventEmitter,
          MGWishlistState>,
      public std::enable_shared_from_this<MGWishlistShadowNode> {
 public:
  MGWishlistShadowNode(
      ShadowNodeFragment const &fragment,
      ShadowNodeFamily::Shared const &family,
      ShadowNodeTraits traits);

  MGWishlistShadowNode(
      ShadowNode const &sourceShadowNode,
      ShadowNodeFragment const &fragment);

  using ConcreteViewShadowNode::ConcreteViewShadowNode;

  void layout(LayoutContext layoutContext) override;

 private:
  void updateStateIfNeeded();
};

} // namespace react
} // namespace facebook
