#include "ComponentsPool.h"

#include <iostream>

using namespace facebook::react;
using namespace jsi;

namespace Wishlist {

void ComponentsPool::setNames(std::vector<std::string> names) {
  nameToIndex.clear();
  for (int i = 0; i < names.size(); ++i) {
    nameToIndex[names[i]] = i;
  }
}

void ComponentsPool::returnToPool(std::shared_ptr<const ShadowNode> sn) {
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

std::shared_ptr<const ShadowNode> ComponentsPool::getNodeForType(
    std::string type) {
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

jsi::Object ComponentsPool::prepareProxy(jsi::Runtime &rt) {
  if (proxy == nullptr) {
    proxy = std::static_pointer_cast<jsi::HostObject>(
        std::make_shared<ComponentsPool::Proxy>(shared_from_this()));
  }
  return jsi::Object::createFromHostObject(rt, this->proxy);
}

ComponentsPool::Proxy::Proxy(std::weak_ptr<ComponentsPool> wcp) : wcp(wcp) {}

Value ComponentsPool::Proxy::get(Runtime &rt, const PropNameID &nameProp) {
  std::string name = nameProp.utf8(rt);

  if (name == "getComponent") {
    std::weak_ptr<ComponentsPool> blockWcp = this->wcp;
    return jsi::Function::createFromHostFunction(
        rt,
        nameProp,
        1,
        [blockWcp](
            Runtime &rt, const Value &thisVal, const Value *args, size_t count)
            -> Value {
          std::string type = args[0].asString(rt).utf8(rt);
          auto sn = blockWcp.lock()->getNodeForType(type);

          return jsi::Object::createFromHostObject(
              rt, std::make_shared<ShadowNodeBinding>(sn, blockWcp, type, ""));
        });
  }

  return jsi::Value::undefined();
}

void ComponentsPool::Proxy::set(
    Runtime &rt,
    const PropNameID &name,
    const Value &value) {
  throw jsi::JSError(rt, "set hasn't been implemented yet");
}

}; // namespace Wishlist
