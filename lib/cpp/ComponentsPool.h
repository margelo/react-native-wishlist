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
#include <react/renderer/core/ConcreteComponentDescriptor.h>

using namespace facebook::react;
using namespace jsi;

struct ShadowNodeBinding : public jsi::HostObject, std::enable_shared_from_this<ShadowNodeBinding> {
    
    std::weak_ptr<ShadowNodeBinding> parent;
    std::shared_ptr<const ShadowNode> sn;
    
    ShadowNodeBinding(std::shared_ptr<const ShadowNode> sn, std::shared_ptr<ShadowNodeBinding> parent=nullptr) {
        this->sn = sn;
        this->parent = parent;
    }
    
    virtual Value get(Runtime & rt, const PropNameID& nameProp) {
        std::string name = nameProp.utf8(rt);
        
        if (name == "addProps") {
            return jsi::Function::createFromHostFunction(rt, nameProp, 1, [=](
                jsi::Runtime &rt,
                jsi::Value const &thisValue,
                jsi::Value const *args,
                size_t count) -> jsi::Value {
                    RawProps rawProps(rt, args[0]);
                    
                    auto &cd = sn->getComponentDescriptor();
                    
                    PropsParserContext propsParserContext{
                        sn->getFamily().getSurfaceId(), *cd.getContextContainer().get()};

                   
                    auto clonedShadowNode = cd.cloneShadowNode(
                        *sn,
                        {
                            cd.cloneProps(
                                propsParserContext, sn->getProps(), rawProps),
                            nullptr,
                        });
                    
                    sn = clonedShadowNode;
                   
                    std::shared_ptr<ShadowNodeBinding> currentParent = parent.lock();
                    std::shared_ptr<ShadowNode> currentSN = clonedShadowNode;
                    while (currentParent != nullptr) {
                        auto &cd = currentParent->sn->getComponentDescriptor();
                        auto children = currentParent->sn->getChildren();
                        for (int i = 0; i < children.size(); ++i) {
                            if (children[i]->getTag() == currentSN->getTag()) {
                                children[i] = currentSN;
                                break;
                            }
                        }
                        currentSN = cd.cloneShadowNode(*(currentParent->sn), {nullptr, std::make_shared<SharedShadowNodeList>(children)});
                        currentParent->sn = currentSN;
                        currentParent = currentParent->parent.lock();
                    }
                    
                    return jsi::Value::undefined();
            });
        }
        
        if (name == "at") {
            return jsi::Function::createFromHostFunction(rt, nameProp, 1, [=](
                jsi::Runtime &rt,
                jsi::Value const &thisValue,
                jsi::Value const *args,
                size_t count) -> jsi::Value {
                    int index = (int) (args[0].getNumber());
                    std::string type = sn->getComponentName();
                    
                    int i = 0;
                    
                    for (auto sibiling : parent.lock()->sn->getChildren()) {
                        if (sibiling->getComponentName() == type) {
                            if (i == index) {
                                return jsi::Object::createFromHostObject(rt, std::make_shared<ShadowNodeBinding>(sibiling, parent.lock()));
                            }
                            i++;
                        }
                    }
                    
                    return jsi::Value::undefined();
            });
        }
        
        for (auto child : sn->getChildren()) {
            if (child->getComponentName() == name) {
                return jsi::Object::createFromHostObject(rt, std::make_shared<ShadowNodeBinding>(child, shared_from_this()));
            }
        }
        
        return jsi::Value::undefined();
    }

  
    virtual void set(Runtime & rt, const PropNameID& name, const Value& value) {
        throw jsi::JSError(rt, "set hasn't been implemented yet");
    }
};

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
    
    class Proxy : public jsi::HostObject {
    public:
        std::weak_ptr<ComponentsPool> wcp;
        Proxy(std::weak_ptr<ComponentsPool> wcp) {
            this->wcp = wcp;
        }
        
        virtual Value get(Runtime & rt, const PropNameID& nameProp) {
            std::string name = nameProp.utf8(rt);
            
            if (name == "getComponent") {
                std::weak_ptr<ComponentsPool> blockWcp = this->wcp;
                return jsi::Function::createFromHostFunction(rt, jsi::PropNameID::forUtf8(rt, std::string("getComponent")), 1, [blockWcp](Runtime & rt, const Value& thisVal, const Value* args, size_t count) -> Value {
                    
                    std::string componentName = args[0].asString(rt).utf8(rt);
                    auto sn = blockWcp.lock()->getNodeForType(componentName);
                    
                    return jsi::Object::createFromHostObject(rt, std::make_shared<ShadowNodeBinding>(sn));
                });
            }
            
            return jsi::Value::undefined();
        }

      
        virtual void set(Runtime & rt, const PropNameID& name, const Value& value) {
            throw jsi::JSError(rt, "set hasn't been implemented yet");
        }
    };
};

#endif /* ComponentsPool_hpp */
