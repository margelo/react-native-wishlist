#include "ComponentsPool.h"
#include <iostream>

using namespace facebook::react;
using namespace jsi;

namespace Wishlist {

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
          int tag = this->sn->getTag();
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

  if (name == "addProps") { // TODO implement that
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
              sn->getFamily().getSurfaceId(), *cd.getContextContainer().get()};

          auto nextProps =
              cd.cloneProps(propsParserContext, sn->getProps(), rawProps);

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

          auto &cd = sn->getComponentDescriptor();

          PropsParserContext propsParserContext{
              sn->getFamily().getSurfaceId(), *cd.getContextContainer().get()};

          ShadowNode::UnsharedListOfShared newChildren =
              std::make_shared<ShadowNode::ListOfShared>();

          for (int i = 0; i < subItems.size(rt); ++i) {
            std::shared_ptr<ShadowNodeBinding> child =
                subItems.getValueAtIndex(rt, i)
                    .getObject(rt)
                    .getHostObject<ShadowNodeBinding>(rt);
            newChildren->push_back(child->sn);
            child->parent = shared_from_this();
          }

          auto clonedShadowNode = cd.cloneShadowNode(
              *sn,
              {
                  nullptr,
                  newChildren,
              });

          auto oldChildren = sn->getChildren();
          auto cp = this->wcp.lock();
          for (int i = 0; i < oldChildren.size(); ++i) {
            if (cp) {
              cp->returnToPool(oldChildren[i]);
            }
          }

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
          std::string type = sn->getComponentName();

          int i = 0;

          for (auto sibiling : parent->sn->getChildren()) {
            if (sibiling->getComponentName() == type) {
              if (i == index) {
                return jsi::Object::createFromHostObject(
                    rt,
                    std::make_shared<ShadowNodeBinding>(sibiling, wcp, parent));
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
          rt,
          std::make_shared<ShadowNodeBinding>(
              child, this->wcp, shared_from_this()));
    }
  }

  return jsi::Value::undefined();
}

}; // namespace Wishlist
