//
//  ComponentsPool.hpp
//  MGWishList
//
//  Created by Szymon on 27/11/2021.
//

#ifndef ComponentsPool_hpp
#define ComponentsPool_hpp

#include <stdio.h>
#include "ShadowNodeCopyMachine.h"
#include <memory>
#include <map>

using namespace facebook::react;

struct ComponentsPool
{
    std::map<std::string, int> nameToIndex;
    std::map<int, std::string> tagToType;
    std::map<std::string, std::vector<std::shared_ptr<const ShadowNode>>> reusable;
    std::vector<std::shared_ptr<ShadowNode const>> registeredViews;
    
    void returnToPool(std::shared_ptr<const ShadowNode> sn) {
        std::string type = tagToType[sn->getTag()];
        reusable[type].push_back(sn);
    }
    
    std::shared_ptr<const ShadowNode> getNodeForType(std::string type) {
        if (reusable[type].size() > 0) {
            auto res = reusable[type].back();
            reusable[type].pop_back();
            return res;
        }
        
        std::shared_ptr<const ShadowNode> templateNode = registeredViews[nameToIndex[type]];
        std::shared_ptr<const ShadowNode> deepCopy = ShadowNodeCopyMachine::copyShadowSubtree(templateNode);
        tagToType[deepCopy->getTag()] = type;
        return deepCopy;
    }
    
    /*jsi::HostObject prepareProxy(std::string type, jsi::Runtime &rt) {
        std::shared_ptr<const ShadowNode> node = getNodeForType(type);
        //TODO
        return
    }*/
};

#endif /* ComponentsPool_hpp */
