#include "ComponentsPool.h"

#include <iostream>

using namespace facebook::react;
using namespace jsi;

namespace Wishlist {

void ComponentsPool::setNames(const std::vector<std::string> &names) {
  nameToIndex_.clear();
  for (int i = 0; i < names.size(); ++i) {
    nameToIndex_[names[i]] = i;
  }
}

void ComponentsPool::setRegisteredViews(
    std::vector<ShadowNode::Shared> registeredViews) {
  registeredViews_ = registeredViews;
}

void ComponentsPool::returnToPool(ShadowNode::Shared sn) {
  if (sn == nullptr) {
    return;
  }
  ShadowNodeCopyMachine::clearParent(sn);
  std::string type = tagToType_[sn->getTag()];
  reusable_[type].push_back(sn);
}

void ComponentsPool::templatesUpdated() {
  // optimise by reusing some of elements if they are
  // the same
  tagToType_.clear();
  reusable_.clear();
}

ShadowNode::Shared ComponentsPool::getNodeForType(const std::string &type) {
  if (reusable_[type].size() > 0) {
    auto res = reusable_[type].back();
    reusable_[type].pop_back();
    return res;
  }

  auto templateNode = registeredViews_[nameToIndex_[type]];
  auto deepCopy = ShadowNodeCopyMachine::copyShadowSubtree(templateNode);
  tagToType_[deepCopy->getTag()] = type;
  return deepCopy;
}

jsi::Object ComponentsPool::prepareProxy(jsi::Runtime &rt) {
  if (proxy_ == nullptr) {
    proxy_ = std::static_pointer_cast<jsi::HostObject>(
        std::make_shared<ComponentsPool::Proxy>(shared_from_this()));
  }
  return jsi::Object::createFromHostObject(rt, proxy_);
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
