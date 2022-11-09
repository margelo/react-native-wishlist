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
    : ConcreteViewShadowNode(sourceShadowNode, fragment) {
  const MGWishlistShadowNode &msn =
      static_cast<const MGWishlistShadowNode &>(sourceShadowNode);
  refreshControl_ = msn.refreshControl_;
}

void MGWishlistShadowNode::appendChild(ShadowNode::Shared const &childNode) {
  if (strcmp(
          childNode->getComponentDescriptor().getComponentName(),
          "PullToRefreshView") == 0) {
    refreshControl_ = childNode;
  }
  ConcreteViewShadowNode::appendChild(childNode);
}

void MGWishlistShadowNode::layout(LayoutContext layoutContext) {
  auto state = getStateData();
  if (!state.initialised) {
    state.initialised = true;
    state.viewportObserver->setInitialValues(shared_from_this(), layoutContext);

    setStateData(std::move(state));
  }
  // TODO update viewportObserver if needed

  ConcreteViewShadowNode::layout(layoutContext);

  updateStateIfNeeded();
}

const ShadowNode::Shared &MGWishlistShadowNode::getRefreshControl() const {
  return refreshControl_;
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
