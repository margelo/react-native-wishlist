#include "ShadowNodeCopyMachine.h"
#include "MGWishlistComponentDescriptor.h"
#include "WishlistJsRuntime.h"

namespace Wishlist {

int tag = -2;

std::shared_ptr<const ShadowNode> ShadowNodeCopyMachine::copyShadowSubtree(
    std::shared_ptr<const ShadowNode> sn) {
  const ComponentDescriptor &cd = sn->getComponentDescriptor();

  PropsParserContext propsParserContext{
      sn->getSurfaceId(), *cd.getContextContainer().get()};

  if (tag < -2e9) {
    tag = -2;
  }

  auto const fragment =
      ShadowNodeFamilyFragment{tag -= 2, sn->getSurfaceId(), nullptr};
  auto &rt = WishlistJsRuntime::getInstance().getRuntime();
  auto eventTarget = std::make_shared<EventTarget>(rt, jsi::Object(rt), tag);

  auto family = // std::make_shared<ShadowNodeFamily>(fragment, nullptr, cd);
      cd.createFamily(
          fragment,
          eventTarget); // TODO create handler on js side
  auto const props = cd.cloneProps(
      propsParserContext, sn->getProps(), sn->getProps()->rawProps);
  auto const state = cd.createInitialState(ShadowNodeFragment{props}, family);

  // prevent fabric from clearing EventTarget
  auto *familyH = reinterpret_cast<const ShadowNodeFamilyHack *>(family.get());
  familyH->eventEmitter_->setEnabled(true);

  auto shadowNode = cd.createShadowNode(
      ShadowNodeFragment{
          /* .props = */
          props,
          /* .children = */ ShadowNodeFragment::childrenPlaceholder(),
          /* .state = */ state,
      },
      family);
  auto clonedShadowNode = cd.cloneShadowNode(*shadowNode.get(), {});

  for (std::shared_ptr<const ShadowNode> child : sn->getChildren()) {
    std::shared_ptr<const ShadowNode> clonedChild = copyShadowSubtree(child);
    cd.appendChild(clonedShadowNode, clonedChild);
  }

  return clonedShadowNode;
}

}; // namespace Wishlist
