#pragma once

#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <React-Fabric/react/renderer/components/view/ConcreteViewShadowNode.h>
#include <iostream>
#include "MGTemplateContainerShadowNode.h"

namespace facebook {
namespace react {

using MGTemplateContainerComponentDescriptor =
    ConcreteComponentDescriptor<MGTemplateContainerShadowNode>;

} // namespace react
} // namespace facebook
