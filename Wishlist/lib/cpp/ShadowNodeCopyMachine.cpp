#include "ShadowNodeCopyMachine.h"
#include "WishlistComponentDescriptors.h"

namespace facebook {
namespace react {

int tag = 1e9+2;

std::shared_ptr<const ShadowNode> ShadowNodeCopyMachine::copyShadowSubtree(std::shared_ptr<const ShadowNode> sn) {
    const ComponentDescriptor &cd = sn->getComponentDescriptor();
    
    
    PropsParserContext propsParserContext{sn->getSurfaceId(), *cd.getContextContainer().get()};
   
    auto const fragment = ShadowNodeFamilyFragment{tag-=2, sn->getSurfaceId(), nullptr};
    auto family = //std::make_shared<ShadowNodeFamily>(fragment, nullptr, cd);
        cd.createFamily(fragment, nullptr); //TODO create handler on js side
    auto const props =
        cd.cloneProps(propsParserContext, sn->getProps(), {});
    auto const state =
        cd.createInitialState(ShadowNodeFragment{props}, family);

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

};
};

