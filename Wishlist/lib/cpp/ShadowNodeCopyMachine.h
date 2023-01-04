#ifndef ShadowNodeCopyMachine_hpp
#define ShadowNodeCopyMachine_hpp

#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <iostream>
#include "LayoutConstraints.h"
#include "LayoutContext.h"
#include "WishlistProps.h"

#include <stdio.h>

namespace facebook {
namespace react {

class ShadowNodeCopyMachine {
 public:
  static std::shared_ptr<const ShadowNode> copyShadowSubtree(
      std::shared_ptr<const ShadowNode> sn);
};

}; // namespace react
}; // namespace facebook

#endif /* ShadowNodeCopyMachine_hpp */
