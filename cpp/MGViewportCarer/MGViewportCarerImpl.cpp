#include "MGViewportCarerImpl.h"

#include "MGUIManagerHolder.h"
#include "MGWishlistShadowNode.h"
#include "WishlistJsRuntime.h"

using namespace facebook::react;

void MGViewportCarerImpl::setDI(std::weak_ptr<MGDI> _di) {
  this->di = _di;
}

void MGViewportCarerImpl::setInitialValues(
    std::shared_ptr<ShadowNode> wishListNode,
    LayoutContext lc) {
  this->wishListNode = wishListNode;
  this->lc = lc;
}

void MGViewportCarerImpl::initialRenderAsync(
    MGDims dimensions,
    float initialOffset,
    int originItem,
    std::vector<std::shared_ptr<ShadowNode const>> registeredViews,
    std::vector<std::string> names,
    std::string inflatorId) {
  WishlistJsRuntime::getInstance().accessRuntime([=](jsi::Runtime &rt) {
    componentsPool->registeredViews = registeredViews;
    componentsPool->setNames(names);

    itemProvider = std::static_pointer_cast<ItemProvider>(
        std::make_shared<WorkletItemProvider>(
            di, dimensions.width, lc, inflatorId));
    itemProvider->setComponentsPool(componentsPool);

    this->surfaceId = wishListNode->getFamily().getSurfaceId();
    this->offset = initialOffset;
    this->windowHeight = dimensions.height;
    this->windowWidth = dimensions.width;
    this->inflatorId = inflatorId;

    window.push_back(itemProvider->provide(originItem));
    window.back().offset = initialOffset;
    updateWindow();
  });
}

void MGViewportCarerImpl::didScrollAsync(
    MGDims dimensions,
    std::vector<std::shared_ptr<ShadowNode const>> registeredViews,
    std::vector<std::string> names,
    float newOffset,
    std::string inflatorId) {
  WishlistJsRuntime::getInstance().accessRuntime([=](jsi::Runtime &rt) {
    if (dimensions.width != windowWidth || !names.empty() ||
        inflatorId != this->inflatorId) {
      componentsPool->registeredViews = registeredViews;
      componentsPool->setNames(names);

      itemProvider = std::static_pointer_cast<ItemProvider>(
          std::make_shared<WorkletItemProvider>(
              di, dimensions.width, lc, inflatorId));
      itemProvider->setComponentsPool(componentsPool);
      windowWidth = dimensions.width;
      this->inflatorId = inflatorId;
    } else {
      std::set<int> dirty =
          di.lock()->getDataBinding()->applyChangesAndGetDirtyIndices(
              {window[0].index, window.back().index});
      for (auto &item : window) {
        if (dirty.count(item.index) > 0) {
          item.dirty = true;
        }
      }
    }

    this->offset = newOffset;
    this->windowHeight = dimensions.height;

    updateWindow();
  });
}

void MGViewportCarerImpl::updateWindow() {
  float topEdge = offset - windowHeight;
  float bottomEdge = offset + 2 * windowHeight;

  assert(!window.empty());

  // Add above
  while (true) {
    WishItem item = window.front();

    if (item.offset > topEdge) {
      WishItem wishItem = itemProvider->provide(item.index - 1);
      if (wishItem.sn == nullptr) {
        break;
      }
      wishItem.offset = item.offset - wishItem.height;
      window.push_front(wishItem);
    } else {
      break;
    }
  }

  // Add below
  while (true) {
    WishItem item = window.back();
    float bottom = item.offset + item.height;

    if (bottom < bottomEdge) {
      WishItem wishItem = itemProvider->provide(item.index + 1);
      if (wishItem.sn == nullptr) {
        break;
      }
      wishItem.offset = bottom;
      window.push_back(wishItem);
    } else {
      break;
    }
  }

  std::vector<WishItem> itemsToRemove;

  // remove above
  while (true) {
    WishItem item = window.front();
    float bottom = item.offset + item.height;
    if (bottom <= topEdge) {
      window.pop_front();
      itemsToRemove.push_back(item);
      continue;
    } else {
      break;
    }
  }

  // remove below
  while (true) {
    WishItem item = window.back();
    if (item.offset >= bottomEdge) {
      window.pop_back();
      itemsToRemove.push_back(item);
      continue;
    } else {
      break;
    }
  }

  float offset = window[0].offset;
  for (auto &item : window) {
    if (item.dirty) {
      WishItem wishItem = itemProvider->provide(item.index);
      if (wishItem.sn == nullptr) {
        continue;
      }
      item.offset = offset;
      swap(item.sn, wishItem.sn);
      item.height = wishItem.height;

      itemsToRemove.push_back(wishItem);
    }
    offset = item.offset + item.height;
  }

  pushChildren();

  for (auto &item : itemsToRemove) {
    componentsPool->returnToPool(item.sn);
  }
}

std::shared_ptr<ShadowNode> MGViewportCarerImpl::getOffseter(float offset) {
  std::shared_ptr<const YogaLayoutableShadowNode> offseterTemplate =
      std::static_pointer_cast<const YogaLayoutableShadowNode>(
          componentsPool->getNodeForType("__offsetComponent"));

  auto &cd = offseterTemplate->getComponentDescriptor();
  PropsParserContext propsParserContext{
      surfaceId, *cd.getContextContainer().get()};

  // todo remove color
  folly::dynamic props = folly::dynamic::object;
  props["height"] = offset;
  props["width"] = windowWidth;
  props["backgroundColor"] = 0x00001111;

  Props::Shared newProps = cd.cloneProps(
      propsParserContext, offseterTemplate->getProps(), RawProps(props));

  return offseterTemplate->clone({newProps, nullptr, nullptr});
}

void MGViewportCarerImpl::pushChildren() {
  std::shared_ptr<ShadowNode> sWishList = wishListNode;
  if (sWishList == nullptr) {
    return;
  }

  MGUIManagerHolder::getInstance()
      .getUIManager()
      ->getShadowTreeRegistry()
      .visit(surfaceId, [&](const ShadowTree &st) {
        ShadowTreeCommitTransaction transaction =
            [&](RootShadowNode const &oldRootShadowNode)
            -> std::shared_ptr<RootShadowNode> {
          return std::static_pointer_cast<RootShadowNode>(
              oldRootShadowNode.cloneTree(
                  sWishList->getFamily(),
                  [&](const ShadowNode &sn) -> std::shared_ptr<ShadowNode> {
                    auto children =
                        std::make_shared<ShadowNode::ListOfShared>();

                    children->push_back(getOffseter(window[0].offset));

                    for (WishItem &wishItem : window) {
                      if (wishItem.sn != nullptr) {
                        children->push_back(wishItem.sn);
                      }
                    }

                    auto const contentContainer = sn.getChildren()[0]->clone(
                        {nullptr, children, nullptr});

                    // That doesn't seem right as this method can be called on
                    // multiple threads another problem is that it can be called
                    // multiple times
                    wishlistChildren =
                        std::make_shared<ShadowNode::ListOfShared>(
                            ShadowNode::ListOfShared{contentContainer});

                    return sn.clone(
                        ShadowNodeFragment{nullptr, wishlistChildren, nullptr});
                  }));
        };
        st.commit(transaction);
      });

  notifyAboutPushedChildren();
}

// TODO That could cause a lag we may need to push it through state
void MGViewportCarerImpl::notifyAboutPushedChildren() {
  std::shared_ptr<MGPushChildrenListener> listener =
      di.lock()->getPushChildrenListener();
  if (listener != nullptr) {
    std::vector<Item> newWindow;
    for (auto &item : window) {
      newWindow.push_back({item.offset, item.height, item.index, item.key});
    }
    di.lock()->getUIScheduler()->scheduleOnUI([newWindow, listener]() {
      listener->didPushChildren(std::move(newWindow));
    });
    WishlistJsRuntime::getInstance().accessRuntime([=](jsi::Runtime &rt) {
      jsi::Function didPushChildren =
          rt.global()
              .getPropertyAsObject(rt, "global")
              .getPropertyAsObject(rt, "InflatorRegistry")
              .getPropertyAsFunction(rt, "didPushChildren");
      didPushChildren.call(rt, 0);
    });
  }
}
