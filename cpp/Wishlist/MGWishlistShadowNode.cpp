#include "MGWishlistShadowNode.h"

namespace facebook {
namespace react {

extern const char MGWishlistComponentName[] = "MGWishlist";

MGWishlistShadowNode::MGWishlistShadowNode(
    ShadowNodeFragment const &fragment,
    ShadowNodeFamily::Shared const &family,
    ShadowNodeTraits traits)
    : ConcreteViewShadowNode(fragment, family, traits) {}

MGWishlistShadowNode::MGWishlistShadowNode(
    ShadowNode const &sourceShadowNode,
    ShadowNodeFragment const &fragment)
    : ConcreteViewShadowNode(sourceShadowNode, fragment) {}

void MGWishlistShadowNode::layout(LayoutContext layoutContext) {
  auto state = getStateData();
  if (!state.initialised) {
    state.initialised = true;
    state.viewportCarer->setInitialValues(shared_from_this(), layoutContext);

    setStateData(std::move(state));
  }

  ConcreteViewShadowNode::layout(layoutContext);

  // TODO update viewportObserver if needed

  updateStateIfNeeded();
}

void MGWishlistShadowNode::updateStateIfNeeded() {
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

} // namespace react
} // namespace facebook
