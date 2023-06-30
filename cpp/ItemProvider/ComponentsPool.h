#pragma once

#include <react/renderer/core/ConcreteComponentDescriptor.h>
#include <stdio.h>
#include <map>
#include <memory>
#include <sstream>
#include "ShadowNodeBinding.h"
#include "ShadowNodeCopyMachine.h"

using namespace facebook::react;
using namespace jsi;

namespace Wishlist {

struct ComponentsPool : std::enable_shared_from_this<ComponentsPool> {
  std::map<std::string, int> nameToIndex;
  std::map<int, std::string> tagToType;
  std::map<std::string, std::vector<std::shared_ptr<const ShadowNode>>>
      reusable;
  std::vector<std::shared_ptr<ShadowNode const>> registeredViews;
  std::shared_ptr<jsi::HostObject> proxy;

  void setNames(std::vector<std::string> names);

  void returnToPool(std::shared_ptr<const ShadowNode> sn);

  void templatesUpdated() { // optimise by reusing some of elements if they are
    // the same
    tagToType.clear();
    reusable.clear();
  }

  std::shared_ptr<const ShadowNode> getNodeForType(std::string type);

  jsi::Object prepareProxy(jsi::Runtime &rt);

  class Proxy : public jsi::HostObject {
   public:
    std::weak_ptr<ComponentsPool> wcp;

    Proxy(std::weak_ptr<ComponentsPool> wcp);

    virtual Value get(Runtime &rt, const PropNameID &nameProp);

    virtual void set(Runtime &rt, const PropNameID &name, const Value &value);
  };
};

}; // namespace Wishlist
