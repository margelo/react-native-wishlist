//
//  ShadowNodeCopyMachine.cpp
//  MGWishList
//
//  Created by Szymon on 17/11/2021.
//

#include "ShadowNodeCopyMachine.hpp"
#include "ModuleComponentDescriptors.h"

namespace facebook {
namespace react {

int tag = 1e9+1;

std::shared_ptr<ShadowNode> ShadowNodeCopyMachine::copyShadowSubtree(std::shared_ptr<const ShadowNode> sn) {
    const ComponentDescriptor &cd = sn->getComponentDescriptor();
    
    
    PropsParserContext propsParserContext{sn->getSurfaceId(), *cd.getContextContainer().get()};
   
    auto const fragment = ShadowNodeFamilyFragment{tag-=2, sn->getSurfaceId(), nullptr};
    auto family =
        cd.createFamily(fragment, sn->getFamily()._even); //TODO create handler on js side
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
    
    for (std::shared_ptr<const ShadowNode> child : sn->getChildren()) {
        std::shared_ptr<ShadowNode> clonedChild = copyShadowSubtree(child);
        shadowNode->appendChild(clonedChild);
    }

    return shadowNode;
}

};
};

