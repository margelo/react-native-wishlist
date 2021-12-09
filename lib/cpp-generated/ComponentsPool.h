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
#include "decorator.h"

using namespace facebook::react;
using namespace jsi;

struct ComponentsPool : std::enable_shared_from_this<ComponentsPool>
{
    std::map<std::string, int> nameToIndex;
    std::map<int, std::string> tagToType;
    std::map<std::string, std::vector<std::shared_ptr<const ShadowNode>>> reusable;
    std::vector<std::shared_ptr<ShadowNode const>> registeredViews;
    std::shared_ptr<jsi::HostObject> proxy;
    
    void setNames(std::vector<std::string> names) {
        for (int i = 0; i < names.size(); ++i) {
            nameToIndex[names[i]] = i;
        }
    }
    
    void returnToPool(std::shared_ptr<const ShadowNode> sn) {
        std::string type = tagToType[sn->getTag()];
        if (type == "") {
            int x = 4;
        }
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
    
    jsi::Object prepareProxy(jsi::Runtime &rt) {
        if (proxy == nullptr) {
            proxy = std::static_pointer_cast<jsi::HostObject>(std::make_shared<ComponentsPool::Proxy>(shared_from_this()));
        }
        return jsi::Object::createFromHostObject(rt, this->proxy);
    }
    
    class Proxy : jsi::HostObject {
    public:
        std::weak_ptr<ComponentsPool> wcp;
        Proxy(std::weak_ptr<ComponentsPool> wcp) {
            this->wcp = wcp;
        }
        
        virtual Value get(Runtime & rt, const PropNameID& nameProp) {
            std::string name = nameProp.utf8(rt);
            
            if (name == "getComponent") {
                return jsi::Function::createFromHostFunction(rt, createPropNameIDFromString(std::string("getComponent")), 1, [](Runtime & rt, const Value& thisVal, const Value* args, size_t count) -> Value {
                    //TODO return shadow node wrapper
                });
            }
        }

      
        virtual void set(Runtime & rt, const PropNameID& name, const Value& value) {
            
        }
    };
};

#endif /* ComponentsPool_hpp */
