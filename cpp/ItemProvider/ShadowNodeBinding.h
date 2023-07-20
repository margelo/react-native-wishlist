#pragma once

#include <react/renderer/core/ConcreteComponentDescriptor.h>
#include <stdio.h>
#include <map>
#include <memory>
#include <sstream>
#include "ShadowNodeCopyMachine.h"

using namespace facebook;
using namespace facebook::react;

namespace Wishlist {

class ComponentsPool;

class ShadowNodeBinding
    : public jsi::HostObject,
      public std::enable_shared_from_this<ShadowNodeBinding> {
 public:
  ShadowNodeBinding(
      std::shared_ptr<const ShadowNode> sn,
      std::weak_ptr<ComponentsPool> wcp,
      const std::string &type,
      const std::string &key);

  ShadowNodeBinding(
      std::shared_ptr<const ShadowNode> sn,
      std::weak_ptr<ComponentsPool> wcp,
      std::shared_ptr<ShadowNodeBinding> parent);

  virtual jsi::Value get(jsi::Runtime &rt, const jsi::PropNameID &nameProp);

  virtual void
  set(jsi::Runtime &rt, const jsi::PropNameID &name, const jsi::Value &value);

  std::string getType() const;
  std::string getKey() const;
  ShadowNode::Shared getShadowNode() const;

 private:
  void describe(
      std::stringstream &ss,
      const std::shared_ptr<const ShadowNode> n,
      int level);

  std::shared_ptr<ShadowNodeBinding> findNodeByWishId(
      const std::string &nativeId,
      std::shared_ptr<ShadowNodeBinding> p);

 private:
  std::shared_ptr<const ShadowNode> sn_;
  std::weak_ptr<ComponentsPool> wcp_;
  std::shared_ptr<ShadowNodeBinding> parent_;
  std::string type_;
  std::string key_;
};

}; // namespace Wishlist
