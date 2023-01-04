#include "MGTemplateContainerShadowNode.h"
#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/components/wishlist/Props.h>
#include <react/renderer/core/ComponentDescriptor.h>

namespace facebook {
namespace react {

extern const char MGTemplateContainerComponentName[] = "MGTemplateContainer";

void MGTemplateContainerShadowNode::appendChild(
    ShadowNode::Shared const &childNode) {
  this->templates.push_back(childNode);
  std::shared_ptr<const MGTemplateContainerProps> props =
      std::dynamic_pointer_cast<const MGTemplateContainerProps>(
          this->getProps());
  if (props->names.size() == this->templates.size()) { // last Child
    PropsParserContext propsParserContext{
        getSurfaceId(),
        *this->getComponentDescriptor().getContextContainer().get()};
    auto rawProps = RawProps();
    rawProps.parse(RawPropsParser(), propsParserContext);
    auto newProps = std::make_shared<MGTemplateContainerProps>(
        propsParserContext, *props, rawProps);
    props_ = newProps;
  }
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
