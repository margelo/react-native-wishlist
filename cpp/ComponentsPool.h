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

struct ComponentsPool;

struct ShadowNodeBinding : public jsi::HostObject,
                           std::enable_shared_from_this<ShadowNodeBinding> {
  std::shared_ptr<ShadowNodeBinding> parent;
  std::shared_ptr<const ShadowNode> sn;
  std::weak_ptr<ComponentsPool> wcp;
  std::string key;

  ShadowNodeBinding(
      std::shared_ptr<const ShadowNode> sn,
      std::weak_ptr<ComponentsPool> wcp,
      std::shared_ptr<ShadowNodeBinding> parent = nullptr) {
    this->sn = sn;
    this->parent = parent;
    this->wcp = wcp;
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
    // ss << " " << n->getProps()->getDebugDescription();
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
      auto bc = std::make_shared<ShadowNodeBinding>(child, wcp, p);

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

  virtual Value get(Runtime &rt, const PropNameID &nameProp);

  virtual void set(Runtime &rt, const PropNameID &name, const Value &value) {
    std::string str = name.utf8(rt);
    if (str == "key") {
      this->key = value.asString(rt).utf8(rt);
    }
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
    auto *family =
        reinterpret_cast<const ShadowNodeFamilyHack *>(&sn->getFamily());
    family->hasParent_ = false;
    family->parent_.reset();
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
                  rt, std::make_shared<ShadowNodeBinding>(sn, blockWcp));
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
