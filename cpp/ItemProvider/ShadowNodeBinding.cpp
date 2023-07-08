#include "ShadowNodeBinding.h"

#include "ComponentsPool.h"

#include <iostream>

using namespace facebook::react;
using namespace jsi;

namespace Wishlist {

ShadowNodeBinding::ShadowNodeBinding(
    std::shared_ptr<const ShadowNode> sn,
    std::weak_ptr<ComponentsPool> wcp,
    const std::string &type,
    const std::string &key)
    : sn_(sn), wcp_(wcp), parent_(nullptr), type_(type), key_(key) {}

ShadowNodeBinding::ShadowNodeBinding(
    std::shared_ptr<const ShadowNode> sn,
    std::weak_ptr<ComponentsPool> wcp,
    std::shared_ptr<ShadowNodeBinding> parent)
    : sn_(sn),
      wcp_(wcp),
      parent_(parent),
      type_(parent->type_),
      key_(parent->key_) {}

std::string ShadowNodeBinding::getType() const {
  return type_;
}

std::string ShadowNodeBinding::getKey() const {
  return key_;
}

ShadowNode::Shared ShadowNodeBinding::getShadowNode() const {
  return sn_;
}

void ShadowNodeBinding::describe(
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

std::shared_ptr<ShadowNodeBinding> ShadowNodeBinding::findNodeByWishId(
    const std::string &nativeId,
    std::shared_ptr<ShadowNodeBinding> p) {
  for (auto child : p->sn_->getChildren()) {
    // Create binding
    auto bc = std::make_shared<ShadowNodeBinding>(child, wcp_, p);

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

Value ShadowNodeBinding::get(Runtime &rt, const PropNameID &nameProp) {
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
          int tag = sn_->getTag();
          std::string eventName = std::to_string(tag) + callbackName;
          std::cout << "register native for name " << eventName << std::endl;
          jsi::Function callback = args[1].asObject(rt).asFunction(rt);

          auto handlerRegistry = rt.global()
                                     .getPropertyAsObject(rt, "global")
                                     .getPropertyAsObject(rt, "handlers");
          handlerRegistry.setProperty(rt, eventName.c_str(), callback);

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
          // TODO: Avoid this extra call into JS by wrapping this function in
          // JS.
          auto processProps = rt.global()
                                  .getPropertyAsObject(rt, "global")
                                  .getPropertyAsObject(rt, "__wishlistInflatorRegistry")
                                  .getPropertyAsFunction(rt, "processProps");
          auto props = processProps.call(rt, args[0]);
          RawProps rawProps(rt, props);

          auto &cd = sn_->getComponentDescriptor();

          PropsParserContext propsParserContext{
              sn_->getFamily().getSurfaceId(), *cd.getContextContainer().get()};

          auto nextProps =
              cd.cloneProps(propsParserContext, sn_->getProps(), rawProps);

          auto clonedShadowNode = cd.cloneShadowNode(
              *sn_,
              {
                  nextProps,
                  nullptr,
              });

          sn_ = clonedShadowNode;

          std::shared_ptr<ShadowNodeBinding> currentParent = parent_;
          std::shared_ptr<ShadowNode> currentSN = clonedShadowNode;
          while (currentParent != nullptr) {
            auto &cd = currentParent->sn_->getComponentDescriptor();
            auto children = currentParent->sn_->getChildren();
            for (int i = 0; i < children.size(); ++i) {
              if (children[i]->getTag() == currentSN->getTag()) {
                children[i] = currentSN;
                break;
              }
            }
            currentSN = cd.cloneShadowNode(
                *(currentParent->sn_),
                {nullptr,
                 std::make_shared<ShadowNode::ListOfShared>(children)});
            currentParent->sn_ = currentSN;
            currentParent = currentParent->parent_;
          }

          return jsi::Value::undefined();
        });
  }

  if (name == "setChildren") {
    return jsi::Function::createFromHostFunction(
        rt,
        nameProp,
        1,
        [=](jsi::Runtime &rt,
            jsi::Value const &thisValue,
            jsi::Value const *args,
            size_t count) -> jsi::Value {
          if (!args[0].isObject() or !args[0].getObject(rt).isArray(rt)) {
            return jsi::Value::undefined();
          }
          jsi::Array subItems = args[0].asObject(rt).asArray(rt);

          auto &cd = sn_->getComponentDescriptor();

          ShadowNode::UnsharedListOfShared newChildren =
              std::make_shared<ShadowNode::ListOfShared>();

          for (int i = 0; i < subItems.size(rt); ++i) {
            std::shared_ptr<ShadowNodeBinding> child =
                subItems.getValueAtIndex(rt, i)
                    .getObject(rt)
                    .getHostObject<ShadowNodeBinding>(rt);
            ShadowNodeCopyMachine::clearParent(child->sn_);
            newChildren->push_back(child->sn_);
            child->parent_ = shared_from_this();
          }

          auto clonedShadowNode = cd.cloneShadowNode(
              *sn_,
              {
                  nullptr,
                  newChildren,
              });

          auto oldChildren = sn_->getChildren();
          auto cp = wcp_.lock();
          for (int i = 0; i < oldChildren.size(); ++i) {
            if (cp) {
              cp->returnToPool(oldChildren[i]);
            }
          }

          sn_ = clonedShadowNode;

          std::shared_ptr<ShadowNodeBinding> currentParent = parent_;
          std::shared_ptr<ShadowNode> currentSN = clonedShadowNode;
          while (currentParent != nullptr) {
            auto &cd = currentParent->sn_->getComponentDescriptor();
            auto children = currentParent->sn_->getChildren();
            for (int i = 0; i < children.size(); ++i) {
              if (children[i]->getTag() == currentSN->getTag()) {
                children[i] = currentSN;
                break;
              }
            }
            currentSN = cd.cloneShadowNode(
                *(currentParent->sn_),
                {nullptr,
                 std::make_shared<ShadowNode::ListOfShared>(children)});
            currentParent->sn_ = currentSN;
            currentParent = currentParent->parent_;
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
          return jsi::String::createFromUtf8(rt, sn_->getComponentName());
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
          describe(ss, sn_, 0);
          return jsi::String::createFromUtf8(rt, ss.str());
        });
  }

  if (name == "getByWishId") { // TODO(Szymon) That can be optimised to O(depth)
    // when template preprocessing
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
          std::string type = sn_->getComponentName();

          int i = 0;

          for (auto sibiling : parent_->sn_->getChildren()) {
            if (sibiling->getComponentName() == type) {
              if (i == index) {
                return jsi::Object::createFromHostObject(
                    rt,
                    std::make_shared<ShadowNodeBinding>(
                        sibiling, wcp_, parent_));
              }
              i++;
            }
          }

          return jsi::Value::undefined();
        });
  }

  if (name == "getTag") {
    return jsi::Function::createFromHostFunction(
        rt,
        nameProp,
        0,
        [=](jsi::Runtime &rt,
            jsi::Value const &thisValue,
            jsi::Value const *args,
            size_t count) -> jsi::Value { return jsi::Value(sn_->getTag()); });
  }

  if (name == "key") {
    return jsi::String::createFromUtf8(rt, key_);
  }

  if (name == "type") {
    return jsi::String::createFromUtf8(rt, type_);
  }

  for (auto child : sn_->getChildren()) {
    if (child->getComponentName() == name) {
      return jsi::Object::createFromHostObject(
          rt,
          std::make_shared<ShadowNodeBinding>(child, wcp_, shared_from_this()));
    }
  }

  return jsi::Value::undefined();
}

void ShadowNodeBinding::set(
    Runtime &rt,
    const PropNameID &name,
    const Value &value) {
  std::string str = name.utf8(rt);
  if (str == "key") {
    key_ = value.asString(rt).utf8(rt);
  } else if (str == "type") {
    type_ = value.asString(rt).utf8(rt);
  }
}

}; // namespace Wishlist
