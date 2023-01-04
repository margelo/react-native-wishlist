#ifndef ComponentsPool_hpp
#define ComponentsPool_hpp

#include <react/renderer/core/ConcreteComponentDescriptor.h>
#include <stdio.h>
#include <map>
#include <memory>
#include <sstream>
#include "ShadowNodeCopyMachine.h"
#include "decorator.h"

using namespace facebook::react;
using namespace jsi;

struct ShadowNodeBinding : public jsi::HostObject,
                           std::enable_shared_from_this<ShadowNodeBinding> {
  std::shared_ptr<ShadowNodeBinding> parent;
  std::shared_ptr<const ShadowNode> sn;

  ShadowNodeBinding(
      std::shared_ptr<const ShadowNode> sn,
      std::shared_ptr<ShadowNodeBinding> parent = nullptr) {
    this->sn = sn;
    this->parent = parent;
  }

  void describe(
      std::stringstream &ss,
      const std::shared_ptr<const ShadowNode> n,
      int level) {
    for (auto i = 0; i < level; ++i) {
      ss << " ";
    }
    ss << n->getComponentName();
    if (n->getProps()->nativeId.length() > 0) {
      ss << " (" << n->getProps()->nativeId << ")";
    }
    ss << " " << n->getProps()->getDebugDescription();
    ss << "\n";
    for (auto child : n->getChildren()) {
      describe(ss, child, level + 2);
    }
  };

  std::shared_ptr<ShadowNodeBinding> findNodeByWishId(
      const std::string &nativeId,
      std::shared_ptr<ShadowNodeBinding> p) {
    for (auto child : p->sn->getChildren()) {
      // Create binding
      auto bc = std::make_shared<ShadowNodeBinding>(child, p);

      // Test against native id
      if (child->getProps()->nativeId == nativeId) {
        return bc;
      }

      // Test child's children
      auto binding = findNodeByWishId(nativeId, bc);
      if (binding != nullptr) {
        return binding;
      }
    }
    return nullptr;
  }

  virtual Value get(Runtime &rt, const PropNameID &nameProp) {
    std::string name = nameProp.utf8(rt);

    if (name == "setCallback") {
      return jsi::Function::createFromHostFunction(
          rt,
          nameProp,
          1,
          [=](jsi::Runtime &rt,
              jsi::Value const &thisValue,
              jsi::Value const *args,
              size_t count) -> jsi::Value {
            std::string callbackName = args[0].asString(rt).utf8(rt);
            int tag = this->sn->getTag();
            std::string eventName = std::to_string(tag) + callbackName;
            jsi::Function callback = args[1].asObject(rt).asFunction(rt);

            auto handlerRegistry = rt.global()
                                       .getPropertyAsObject(rt, "global")
                                       .getPropertyAsObject(rt, "handlers");
            handlerRegistry.setProperty(rt, eventName.c_str(), callback);

            return jsi::Value::undefined();
          });
    }
      
    if (name == "setChildren") { // TODO implement that
        return jsi::Function::createFromHostFunction(
            rt,
            nameProp,
            1,
            [=](jsi::Runtime &rt,
                jsi::Value const &thisValue,
                jsi::Value const *args,
                size_t count) -> jsi::Value {
              RawProps rawProps(rt, args[0]);

              auto &cd = sn->getComponentDescriptor();

              PropsParserContext propsParserContext{
                  sn->getFamily().getSurfaceId(),
                  *cd.getContextContainer().get()};

              auto nextProps =
                  cd.cloneProps(propsParserContext, sn->getProps(), rawProps);
              std::cout << nextProps->getDebugValue() << std::endl;

              auto clonedShadowNode = cd.cloneShadowNode(
                  *sn,
                  {
                      nextProps,
                      nullptr,
                  });

              sn = clonedShadowNode;

              std::shared_ptr<ShadowNodeBinding> currentParent = parent;
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
                currentSN = cd.cloneShadowNode(
                    *(currentParent->sn),
                    {nullptr,
                     std::make_shared<ShadowNode::ListOfShared>(children)});
                currentParent->sn = currentSN;
                currentParent = currentParent->parent;
                std::cout << "is currentParent null "
                          << (currentParent == nullptr) << std::endl;
              }

              return jsi::Value::undefined();
            });
    }

    if (name == "addProps") {
      return jsi::Function::createFromHostFunction(
          rt,
          nameProp,
          1,
          [=](jsi::Runtime &rt,
              jsi::Value const &thisValue,
              jsi::Value const *args,
              size_t count) -> jsi::Value {
            RawProps rawProps(rt, args[0]);

            auto &cd = sn->getComponentDescriptor();

            PropsParserContext propsParserContext{
                sn->getFamily().getSurfaceId(),
                *cd.getContextContainer().get()};

            auto nextProps =
                cd.cloneProps(propsParserContext, sn->getProps(), rawProps);
            std::cout << nextProps->getDebugValue() << std::endl;

            auto clonedShadowNode = cd.cloneShadowNode(
                *sn,
                {
                    nextProps,
                    nullptr,
                });

            sn = clonedShadowNode;

            std::shared_ptr<ShadowNodeBinding> currentParent = parent;
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
              currentSN = cd.cloneShadowNode(
                  *(currentParent->sn),
                  {nullptr,
                   std::make_shared<ShadowNode::ListOfShared>(children)});
              currentParent->sn = currentSN;
              currentParent = currentParent->parent;
              std::cout << "is currentParent null "
                        << (currentParent == nullptr) << std::endl;
            }

            return jsi::Value::undefined();
          });
    }

    if (name == "getName") {
      return jsi::Function::createFromHostFunction(
          rt,
          nameProp,
          1,
          [=](jsi::Runtime &rt,
              jsi::Value const &thisValue,
              jsi::Value const *args,
              size_t count) -> jsi::Value {
            return jsi::String::createFromUtf8(rt, sn->getComponentName());
          });
    }

    if (name == "describe") {
      return jsi::Function::createFromHostFunction(
          rt,
          nameProp,
          1,
          [=](jsi::Runtime &rt,
              jsi::Value const &thisValue,
              jsi::Value const *args,
              size_t count) -> jsi::Value {
            std::stringstream ss;
            describe(ss, sn, 0);
            return jsi::String::createFromUtf8(rt, ss.str());
          });
    }

    if (name == "getByWishId") { // That can be optimised to O(depth) when
                                 // template preprocessing
      return jsi::Function::createFromHostFunction(
          rt,
          nameProp,
          1,
          [=](jsi::Runtime &rt,
              jsi::Value const &thisValue,
              jsi::Value const *args,
              size_t count) -> jsi::Value {
            auto binding = findNodeByWishId(
                args[0].asString(rt).utf8(rt), shared_from_this());
            if (binding != nullptr) {
              return jsi::Object::createFromHostObject(rt, binding);
            }

            return jsi::Value::undefined();
          });
    }

    if (name == "at") {
      return jsi::Function::createFromHostFunction(
          rt,
          nameProp,
          1,
          [=](jsi::Runtime &rt,
              jsi::Value const &thisValue,
              jsi::Value const *args,
              size_t count) -> jsi::Value {
            int index = (int)(args[0].getNumber());
            std::string type = sn->getComponentName();

            int i = 0;

            for (auto sibiling : parent->sn->getChildren()) {
              if (sibiling->getComponentName() == type) {
                if (i == index) {
                  return jsi::Object::createFromHostObject(
                      rt,
                      std::make_shared<ShadowNodeBinding>(sibiling, parent));
                }
                i++;
              }
            }

            return jsi::Value::undefined();
          });
    }

    for (auto child : sn->getChildren()) {
      if (child->getComponentName() == name) {
        return jsi::Object::createFromHostObject(
            rt, std::make_shared<ShadowNodeBinding>(child, shared_from_this()));
      }
    }

    return jsi::Value::undefined();
  }

  virtual void set(Runtime &rt, const PropNameID &name, const Value &value) {
    throw jsi::JSError(rt, "set hasn't been implemented yet");
  }
};

struct ComponentsPool : std::enable_shared_from_this<ComponentsPool> {
  std::map<std::string, int> nameToIndex;
  std::map<int, std::string> tagToType;
  std::map<std::string, std::vector<std::shared_ptr<const ShadowNode>>>
      reusable;
  std::vector<std::shared_ptr<ShadowNode const>> registeredViews;
  std::shared_ptr<jsi::HostObject> proxy;

  void setNames(std::vector<std::string> names) {
    nameToIndex.clear();
    for (int i = 0; i < names.size(); ++i) {
      nameToIndex[names[i]] = i;
    }
  }

  void returnToPool(std::shared_ptr<const ShadowNode> sn) {
    if (sn == nullptr) {
      return;
    }
    std::string type = tagToType[sn->getTag()];
    reusable[type].push_back(sn);
  }

  void templatesUpdated() { // optimise by reusing some of elements if they are
                            // the same
    tagToType.clear();
    reusable.clear();
  }

  std::shared_ptr<const ShadowNode> getNodeForType(std::string type) {
    if (reusable[type].size() > 0) {
      auto res = reusable[type].back();
      reusable[type].pop_back();
      return res;
    }

    std::shared_ptr<const ShadowNode> templateNode =
        registeredViews[nameToIndex[type]];
    std::shared_ptr<const ShadowNode> deepCopy =
        ShadowNodeCopyMachine::copyShadowSubtree(templateNode);
    tagToType[deepCopy->getTag()] = type;
    return deepCopy;
  }

  jsi::Object prepareProxy(jsi::Runtime &rt) {
    if (proxy == nullptr) {
      proxy = std::static_pointer_cast<jsi::HostObject>(
          std::make_shared<ComponentsPool::Proxy>(shared_from_this()));
    }
    return jsi::Object::createFromHostObject(rt, this->proxy);
  }

  class Proxy : public jsi::HostObject {
   public:
    std::weak_ptr<ComponentsPool> wcp;
    Proxy(std::weak_ptr<ComponentsPool> wcp) {
      this->wcp = wcp;
    }

    virtual Value get(Runtime &rt, const PropNameID &nameProp) {
      std::string name = nameProp.utf8(rt);

      if (name == "getComponent") {
        std::weak_ptr<ComponentsPool> blockWcp = this->wcp;
        return jsi::Function::createFromHostFunction(
            rt,
            jsi::PropNameID::forUtf8(rt, std::string("getComponent")),
            1,
            [blockWcp](
                Runtime &rt,
                const Value &thisVal,
                const Value *args,
                size_t count) -> Value {
              std::string componentName = args[0].asString(rt).utf8(rt);
              auto sn = blockWcp.lock()->getNodeForType(componentName);

              return jsi::Object::createFromHostObject(
                  rt, std::make_shared<ShadowNodeBinding>(sn));
            });
      }

      return jsi::Value::undefined();
    }

    virtual void set(Runtime &rt, const PropNameID &name, const Value &value) {
      throw jsi::JSError(rt, "set hasn't been implemented yet");
    }
  };
};

#endif /* ComponentsPool_hpp */
