#include "ViewportObserver.hpp"
#include "MGWishlistShadowNode.h"
#import "RCTFollyConvert.h"

using namespace facebook::react;

thread_local bool ViewportObserver::isPushingChildren = false;

std::shared_ptr<ShadowNode> ViewportObserver::getOffseter(float offset)
{
  std::shared_ptr<const YogaLayoutableShadowNode> offseterTemplate =
      std::static_pointer_cast<const YogaLayoutableShadowNode>(componentsPool->getNodeForType("__offsetComponent"));

  auto &cd = offseterTemplate->getComponentDescriptor();
  PropsParserContext propsParserContext{surfaceId, *cd.getContextContainer().get()};

  // todo remove color
  folly::dynamic props = convertIdToFollyDynamic(@{
    @"height" : @(offset),
    @"width" : @(this->windowWidth),
    @"backgroundColor" : @((*(colorFromComponents(ColorComponents{0, 0, 1, 1}))))
  });

  Props::Shared newProps = cd.cloneProps(propsParserContext, offseterTemplate->getProps(), RawProps(props));

  return offseterTemplate->clone({newProps, nullptr, nullptr});
}

void ViewportObserver::pushChildren()
{
  isPushingChildren = true;

  std::shared_ptr<ShadowNode> sWishList = wishListNode;
  if (sWishList.get() == nullptr) {
    return;
  }

  KeyClassHolder::shadowTreeRegistry->visit(surfaceId, [&](const ShadowTree &st) {
    ShadowTreeCommitTransaction transaction =
        [&](RootShadowNode const &oldRootShadowNode) -> std::shared_ptr<RootShadowNode> {
      return std::static_pointer_cast<RootShadowNode>(
          oldRootShadowNode.cloneTree(sWishList->getFamily(), [&](const ShadowNode &sn) -> std::shared_ptr<ShadowNode> {
            auto children = std::make_shared<ShadowNode::ListOfShared>();

            children->push_back(getOffseter(window[0].offset));

            for (WishItem &wishItem : window) {
              if (wishItem.sn != nullptr) {
                children->push_back(wishItem.sn);
              }
            }

            return sn.clone(ShadowNodeFragment{nullptr, children, nullptr});
          }));
    };
    st.commit(transaction);
  });

  isPushingChildren = false;
}

// TODO create it only once
jsi::Value ViewportObserver::getBinding() {
    jsi::Runtime & rt = *ReanimatedRuntimeHandler::rtPtr;
    jsi::Object obj(rt);
    
    obj.setProperty(
    rt,
    "getAllVisibleItems",
    jsi::Function::createFromHostFunction(
      rt,
      jsi::PropNameID::forAscii(rt, "getAllVisibleItems"),
      1,
      [=](jsi::Runtime &rt, const jsi::Value &thisValue, const jsi::Value *args, size_t count) -> jsi::Value {
        
          jsi::Array items(rt, window.size());
          int i = 0;
          for (WishItem & item : window) {
              jsi::Object temp(rt);
              temp.setProperty(rt, "index", item.index);
              temp.setProperty(rt, "key", item.key);
              items.setValueAtIndex(rt, i++, temp);
          }
        return items;
      }));
    
    obj.setProperty(
    rt,
    "markItemsDirty",
    jsi::Function::createFromHostFunction(
      rt,
      jsi::PropNameID::forAscii(rt, "markItemsDirty"),
      1,
      [=](jsi::Runtime &rt, const jsi::Value &thisValue, const jsi::Value *args, size_t count) -> jsi::Value {
          jsi::Array dirtyIndices = args[0].asObject(rt).asArray(rt);
          for (int i = 0; i < dirtyIndices.size(rt); ++i) {
              int dirtyIndex = dirtyIndices.getValueAtIndex(rt, i).asNumber();
              window[dirtyIndex].dirty = true;
          }
        return jsi::Value::undefined();
      }));
    
    obj.setProperty(
    rt,
    "markAllItemsDirty",
    jsi::Function::createFromHostFunction(
      rt,
      jsi::PropNameID::forAscii(rt, "markAllItemsDirty"),
      1,
      [=](jsi::Runtime &rt, const jsi::Value &thisValue, const jsi::Value *args, size_t count) -> jsi::Value {
          for (WishItem & item : window) {
              item.dirty = true;
          }
        return jsi::Value::undefined();
      }));
    
    obj.setProperty(
    rt,
    "updateIndices",
    jsi::Function::createFromHostFunction(
      rt,
      jsi::PropNameID::forAscii(rt, "updateIndices"),
      1,
      [=](jsi::Runtime &rt, const jsi::Value &thisValue, const jsi::Value *args, size_t count) -> jsi::Value {
        
        int newIndexOfFirstElement = args[0].getNumber();
        for (int i = 0; i < window.size(); ++i) {
          window[i].index = newIndexOfFirstElement + i;
        }
        return jsi::Value::undefined();
      }));
    
    return std::move(obj);
}
