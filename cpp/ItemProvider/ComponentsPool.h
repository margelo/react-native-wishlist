#pragma once

#include <React-Fabric/react/renderer/components/view/ConcreteViewShadowNode.h>
#include <stdio.h>
#include <map>
#include <memory>
#include <sstream>
#include "ShadowNodeBinding.h"
#include "ShadowNodeCopyMachine.h"

using namespace facebook::react;
using namespace facebook::jsi;

namespace Wishlist {

class ComponentsPool : public std::enable_shared_from_this<ComponentsPool> {
 public:
  void setNames(const std::vector<std::string> &names);

  void setRegisteredViews(std::vector<ShadowNode::Shared> registeredViews);

  void returnToPool(ShadowNode::Shared sn);

  void templatesUpdated();

  ShadowNode::Shared getNodeForType(const std::string &type);

  Object prepareProxy(Runtime &rt);

  class Proxy : public HostObject {
   public:
    std::weak_ptr<ComponentsPool> wcp;

    Proxy(std::weak_ptr<ComponentsPool> wcp);

    virtual Value get(Runtime &rt, const PropNameID &nameProp);

    virtual void set(Runtime &rt, const PropNameID &name, const Value &value);
  };

 private:
  std::map<std::string, int> nameToIndex_;
  std::map<int, std::string> tagToType_;
  std::map<std::string, std::vector<ShadowNode::Shared>> reusable_;
  std::vector<ShadowNode::Shared> registeredViews_;
  std::shared_ptr<HostObject> proxy_;
};

}; // namespace Wishlist
