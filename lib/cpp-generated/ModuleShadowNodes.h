
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated by codegen project: GenerateShadowNodeH.js
 */

#pragma once

#include "ModuleEventEmitters.h"
#include "ModuleProps.h"
#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include "LayoutContext.h"
#include "LayoutConstraints.h"
#include <iostream>

namespace facebook {
namespace react {

extern const char ModuleComponentName[];

/*
 * `ShadowNode` for <Module> component.
 */

class ModuleShadowNode : public ConcreteViewShadowNode<
                                ModuleComponentName,
                                ModuleProps,
ModuleEventEmitter> {
public:
    ModuleShadowNode(
        ShadowNodeFragment const &fragment,
        ShadowNodeFamily::Shared const &family,
        ShadowNodeTraits traits)
        : ConcreteViewShadowNode(fragment, family, traits) {
     
    }

    ModuleShadowNode(
        ShadowNode const &sourceShadowNode,
        ShadowNodeFragment const &fragment)
        : ConcreteViewShadowNode(sourceShadowNode, fragment) {
        try {
            const ModuleShadowNode &msn = dynamic_cast<const ModuleShadowNode&>(sourceShadowNode);
            registeredViews = msn.registeredViews;
        }
        catch (std::bad_cast) {
              
        }
    }
    
    void appendChild(
                     ShadowNode::Shared const &childNode) {
        //ConcreteViewShadowNode::appendChild(childNode);
        /*std::shared_ptr<const LayoutableShadowNode> lsn = std::dynamic_pointer_cast<const LayoutableShadowNode>(childNode);
        LayoutContext lc;
        LayoutConstraints lcc;
        //lsn->layoutTree(lc);
        std::cout << "sdfwefwef" << std::endl;
        for (int i = 0; i < 10000; ++i) {
            Size sz = lsn->measure(lc, lcc);
            int x = 5;
        }
        
        std::cout << "2 sdfwefwef" << std::endl;*/
        registeredViews.push_back(childNode);
    }
    
    virtual ~ModuleShadowNode(){}
    
    std::vector<std::shared_ptr<ShadowNode const>> registeredViews;
};

} // namespace react
} // namespace facebook
