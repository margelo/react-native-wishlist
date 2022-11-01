#include "MGTemplateContainerShadowNode.h"
#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/components/wishlist/Props.h>
#include <react/renderer/core/ComponentDescriptor.h>

namespace facebook {
namespace react {

extern const char MGTemplateContainerComponentName[] = "MGTemplateContainer";

MGTemplateContainerShadowNode::MGTemplateContainerShadowNode(
    ShadowNode const &sourceShadowNode,
    ShadowNodeFragment const &fragment)
    : ConcreteViewShadowNode(sourceShadowNode, fragment) {
  auto &templateContainerSourceShadowNode =
      static_cast<MGTemplateContainerShadowNode const &>(sourceShadowNode);
  templates = templateContainerSourceShadowNode.templates;
}

void MGTemplateContainerShadowNode::appendChild(
    ShadowNode::Shared const &childNode) {
  this->templates.push_back(childNode);
}

void MGTemplateContainerShadowNode::layout(LayoutContext layoutContext) {
  updateStateIfNeeded();
  ConcreteViewShadowNode::layout(layoutContext);
}

void MGTemplateContainerShadowNode::updateStateIfNeeded() {
  ensureUnsealed();

  auto const &currentState = getStateData();
  if (this->templates == currentState.getTemplates()) {
    return;
  }

  auto state = MGTemplateContainerState{this->templates};
  setStateData(std::move(state));
}

} // namespace react
} // namespace facebook
