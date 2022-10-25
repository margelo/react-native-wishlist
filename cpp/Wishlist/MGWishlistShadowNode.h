#pragma once

#include <jsi/jsi.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/components/wishlist/EventEmitters.h>
#include <react/renderer/components/wishlist/Props.h>
#include <iostream>
#include <memory>
#include "LayoutConstraints.h"
#include "LayoutContext.h"
#include "MGWishlistState.h"
#include "ReanimatedRuntimeHandler.hpp"
#include "ShadowNodeCopyMachine.h"

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
      std::enable_shared_from_this<MGWishlistShadowNode> {
 public:
  MGWishlistShadowNode(
      ShadowNodeFragment const &fragment,
      ShadowNodeFamily::Shared const &family,
      ShadowNodeTraits traits)
      : ConcreteViewShadowNode(fragment, family, traits) {}

  MGWishlistShadowNode(
      ShadowNode const &sourceShadowNode,
      ShadowNodeFragment const &fragment)
      : ConcreteViewShadowNode(sourceShadowNode, fragment) {
    try {
      const MGWishlistShadowNode &msn =
          dynamic_cast<const MGWishlistShadowNode &>(sourceShadowNode);
      registeredViews = msn.registeredViews;

    } catch (std::bad_cast) {
    }
  }

  void realAppendChild(ShadowNode::Shared const &childNode) {
    if (childNode == nullptr) {
      return;
    }
    ConcreteViewShadowNode::appendChild(childNode);
  }

  void appendChild(ShadowNode::Shared const &childNode) {
    return;
  }

  void layout(LayoutContext layoutContext) {
    auto state = getStateData();
    if (!state.initialised) {
      state.initialised = true;
      state.viewportObserver->setInitialValues(
          sharedThis.lock(), layoutContext);

      setStateData(std::move(state));
    }
    // TODO update viewportObserver if needed

    ConcreteViewShadowNode::layout(layoutContext);

    // updateScrollContentOffsetIfNeeded();
    updateStateIfNeeded();
  }

  void updateStateIfNeeded() {
    ensureUnsealed();

    auto contentBoundingRect = Rect{};
    for (const auto &childNode : getLayoutableChildNodes()) {
      contentBoundingRect.unionInPlace(childNode->getLayoutMetrics().frame);
    }

    auto state = getStateData();

    if (state.contentBoundingRect != contentBoundingRect) {
      state.contentBoundingRect = contentBoundingRect;
      setStateData(std::move(state));
    }
  }

  virtual ~MGWishlistShadowNode() {}

  std::vector<std::shared_ptr<ShadowNode const>> registeredViews;
  std::weak_ptr<MGWishlistShadowNode> sharedThis;
};

} // namespace react
} // namespace facebook
