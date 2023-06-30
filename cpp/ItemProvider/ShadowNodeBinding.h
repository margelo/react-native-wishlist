#pragma once

#include <react/renderer/core/ConcreteComponentDescriptor.h>
#include <stdio.h>
#include <map>
#include <memory>
#include <sstream>
#include "ShadowNodeCopyMachine.h"

using namespace facebook::react;
using namespace jsi;

namespace Wishlist {

struct ComponentsPool;

struct ShadowNodeBinding : public jsi::HostObject,
                           std::enable_shared_from_this<ShadowNodeBinding> {
  std::shared_ptr<const ShadowNode> sn;
  std::weak_ptr<ComponentsPool> wcp;
  std::shared_ptr<ShadowNodeBinding> parent;
  std::string key;
  std::string type;

  ShadowNodeBinding(
      std::shared_ptr<const ShadowNode> sn,
      std::weak_ptr<ComponentsPool> wcp,
      const std::string &type,
      const std::string &key);

  ShadowNodeBinding(
      std::shared_ptr<const ShadowNode> sn,
      std::weak_ptr<ComponentsPool> wcp,
      std::shared_ptr<ShadowNodeBinding> parent);

  void describe(
      std::stringstream &ss,
      const std::shared_ptr<const ShadowNode> n,
      int level);

  std::shared_ptr<ShadowNodeBinding> findNodeByWishId(
      const std::string &nativeId,
      std::shared_ptr<ShadowNodeBinding> p);

  virtual Value get(Runtime &rt, const PropNameID &nameProp);

  virtual void set(Runtime &rt, const PropNameID &name, const Value &value);
};

}; // namespace Wishlist
