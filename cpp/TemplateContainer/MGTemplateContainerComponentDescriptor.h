#pragma once

#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/core/ConcreteComponentDescriptor.h>
#include <iostream>
#include "MGTemplateContainerShadowNode.h"

namespace facebook {
namespace react {

class MGTemplateContainerComponentDescriptor
    : public ConcreteComponentDescriptor<MGTemplateContainerShadowNode> {
 public:
  MGTemplateContainerComponentDescriptor(
      ComponentDescriptorParameters const &parameters)
      : ConcreteComponentDescriptor(parameters) {}

  virtual ShadowNode::Shared createShadowNode(
      const ShadowNodeFragment &fragment,
      ShadowNodeFamily::Shared const &family) const override {
    if (fragment.children != nullptr && fragment.children->size() != 0) {
      std::cout << "sdfsdfs" << std::endl;
    }

    /*PropsParserContext propsParserContext{getSurfaceId(),
    *this->getComponentDescriptor().getContextContainer().get()}; auto rawProps
    = RawProps(); auto newProps =
    std::make_shared<MGTemplateContainerComponentProps>(propsParserContext,
    *props, rawProps); newProps->templates = templates; props_ = newProps;*/

    auto shadowNode = std::make_shared<MGTemplateContainerShadowNode>(
        ShadowNodeFragment{fragment.props, fragment.children, fragment.state},
        family,
        getTraits());

    adopt(shadowNode);

    return shadowNode;
  }

  virtual ShadowNode::Unshared cloneShadowNode(
      const ShadowNode &sourceShadowNode,
      const ShadowNodeFragment &fragment) const override {
    ShadowNode::Unshared shadowNode(nullptr);
    shadowNode = std::make_shared<MGTemplateContainerShadowNode>(
        sourceShadowNode, fragment);

    std::shared_ptr<MGTemplateContainerShadowNode> wishlistShadowNode =
        std::static_pointer_cast<MGTemplateContainerShadowNode>(shadowNode);

    adopt(shadowNode);
    return shadowNode;
  }

  virtual ~MGTemplateContainerComponentDescriptor() {}
};

} // namespace react
} // namespace facebook
