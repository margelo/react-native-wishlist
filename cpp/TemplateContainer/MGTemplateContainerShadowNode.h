#pragma once

#include <jsi/jsi.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/components/wishlist/EventEmitters.h>
#include <react/renderer/components/wishlist/Props.h>
#include "LayoutContext.h"
#include "MGTemplateContainerState.h"

namespace facebook {
namespace react {

JSI_EXPORT extern const char MGTemplateContainerComponentName[];

/*
 * `ShadowNode` for <MGTemplateContainer> component.
 */
class JSI_EXPORT MGTemplateContainerShadowNode final
    : public ConcreteViewShadowNode<
          MGTemplateContainerComponentName,
          MGTemplateContainerProps,
          MGTemplateContainerEventEmitter,
          MGTemplateContainerState> {
  using ConcreteViewShadowNode::ConcreteViewShadowNode;

 public:
  MGTemplateContainerShadowNode(
      ShadowNode const &sourceShadowNode,
      ShadowNodeFragment const &fragment);

  std::vector<std::shared_ptr<ShadowNode const>> templates;

  void appendChild(ShadowNode::Shared const &childNode);

  void layout(LayoutContext layoutContext) override;

 private:
  void updateStateIfNeeded();
};

} // namespace react
} // namespace facebook
