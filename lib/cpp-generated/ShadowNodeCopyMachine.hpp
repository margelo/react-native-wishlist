//
//  ShadowNodeCopyMachine.hpp
//  MGWishList
//
//  Created by Szymon on 17/11/2021.
//

#ifndef ShadowNodeCopyMachine_hpp
#define ShadowNodeCopyMachine_hpp

#include "ModuleEventEmitters.h"
#include "ModuleProps.h"
#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include "LayoutContext.h"
#include "LayoutConstraints.h"
#include <iostream>

#include <stdio.h>

namespace facebook {
namespace react {

class ShadowNodeCopyMachine {
public:
    static std::shared_ptr<const ShadowNode> copyShadowSubtree(std::shared_ptr<const ShadowNode> sn);
};

};
};


#endif /* ShadowNodeCopyMachine_hpp */
