#ifndef ShadowNodeCopyMachine_hpp
#define ShadowNodeCopyMachine_hpp

#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/components/wishlist/Props.h>
#include <iostream>
#include "LayoutConstraints.h"
#include "LayoutContext.h"

#include <stdio.h>

namespace facebook {
namespace react {

class ShadowNodeCopyMachine {
 public:
  static std::shared_ptr<const ShadowNode> copyShadowSubtree(
      std::shared_ptr<const ShadowNode> sn);
};

// dirty hack don't do it at home
class ShadowNodeFamilyHack final {
 public:
  using Shared = std::shared_ptr<ShadowNodeFamily const>;
  using Weak = std::weak_ptr<ShadowNodeFamily const>;

  using AncestorList = butter::small_vector<
      std::pair<
          std::reference_wrapper<ShadowNode const> /* parentNode */,
          int /* childIndex */>,
      64>;

  EventDispatcher::Weak eventDispatcher_;
  mutable std::shared_ptr<State const> mostRecentState_;
  mutable butter::shared_mutex mutex_;

  Tag const tag_;
  SurfaceId const surfaceId_;
  SharedEventEmitter const eventEmitter_;
  ComponentDescriptor const &componentDescriptor_;
  ComponentHandle componentHandle_;
  ComponentName componentName_;
  mutable ShadowNodeFamily::Weak parent_{};
  mutable bool hasParent_{false};
};

}; // namespace react
}; // namespace facebook

#endif /* ShadowNodeCopyMachine_hpp */
