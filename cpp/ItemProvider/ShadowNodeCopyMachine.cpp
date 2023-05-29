#include "ShadowNodeCopyMachine.h"
#include "MGWishlistComponentDescriptor.h"
#include "WishlistJsRuntime.h"

namespace Wishlist {

int tag = -2;

ShadowNode::Shared ShadowNodeCopyMachine::copyShadowSubtree(
    const std::shared_ptr<const ShadowNode> &sn) {
  auto const &cd = sn->getComponentDescriptor();

  PropsParserContext propsParserContext{
      sn->getSurfaceId(), *cd.getContextContainer().get()};

  if (tag < -2e9) {
    tag = -2;
  }

  auto const fragment =
      ShadowNodeFamilyFragment{tag -= 2, sn->getSurfaceId(), nullptr};
  auto &rt = WishlistJsRuntime::getInstance().getRuntime();
  auto const eventTarget =
      std::make_shared<EventTarget>(rt, jsi::Object(rt), tag);

  auto const family = cd.createFamily(fragment, eventTarget);
  auto const props = cd.cloneProps(
      propsParserContext,
      sn->getProps(),
#ifdef ANDROID
      sn->getProps()->rawProps
#else
      {}
#endif
  );
  auto const state = cd.createInitialState(ShadowNodeFragment{props}, family);

  // prevent fabric from clearing EventTarget
  auto const *familyH =
      reinterpret_cast<const ShadowNodeFamilyHack *>(family.get());
  familyH->eventEmitter_->setEnabled(true);

  auto shadowNode = cd.createShadowNode(
      ShadowNodeFragment{
          /* .props = */
          props,
          /* .children = */ ShadowNodeFragment::childrenPlaceholder(),
          /* .state = */ state,
      },
      family);

  for (const auto &child : sn->getChildren()) {
    auto const clonedChild = copyShadowSubtree(child);
    cd.appendChild(shadowNode, clonedChild);
  }

  return shadowNode;
}

}; // namespace Wishlist
