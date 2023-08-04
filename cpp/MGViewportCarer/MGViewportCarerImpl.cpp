#include "MGViewportCarerImpl.h"

#include "MGContentContainerShadowNode.h"
#include "MGUIManagerHolder.h"
#include "MGWishlistShadowNode.h"
#include "WishlistJsRuntime.h"

namespace Wishlist {

using namespace facebook::react;

void MGViewportCarerImpl::setDI(const std::weak_ptr<MGDI> &di) {
  di_ = di;
}

void MGViewportCarerImpl::setListener(
    const std::weak_ptr<MGViewportCarerListener> &listener) {
  listener_ = listener;
}

void MGViewportCarerImpl::setInitialValues(
    const std::shared_ptr<MGWishlistShadowNode> &wishListNode,
    const LayoutContext &lc) {
  wishListNode_ = wishListNode;
  lc_ = lc;
}

void MGViewportCarerImpl::initialRenderAsync(
    MGDims dimensions,
    float initialContentSize,
    int originItem,
    const std::vector<std::shared_ptr<ShadowNode const>> &registeredViews,
    const std::vector<std::string> &names,
    const std::string &inflatorId) {
  WishlistJsRuntime::getInstance().accessRuntime([=](jsi::Runtime &rt) {
    componentsPool_->setRegisteredViews(registeredViews);
    componentsPool_->setNames(names);

    itemProvider_ = std::static_pointer_cast<ItemProvider>(
        std::make_shared<WorkletItemProvider>(
            di_, dimensions.width, lc_, inflatorId));
    itemProvider_->setComponentsPool(componentsPool_);

    surfaceId_ = wishListNode_->getFamily().getSurfaceId();
    initialContentSize_ = initialContentSize;
    contentSize_ = {dimensions.width, initialContentSize};
    contentOffset_ = initialContentSize / 2;
    windowHeight_ = dimensions.height;
    windowWidth_ = dimensions.width;
    inflatorId_ = inflatorId;

    window_.push_back(itemProvider_->provide(originItem, nullptr));
    window_.back().offset = initialContentSize / 2;
    updateWindow();
  });
}

void MGViewportCarerImpl::didScrollAsync(
    MGDims dimensions,
    const std::vector<std::shared_ptr<ShadowNode const>> &registeredViews,
    const std::vector<std::string> &names,
    float contentOffset,
    const std::string &inflatorId) {
  // If we are adjusting content size / offset we do not want to process scroll events
  // again here.
  if (updatingContentSize_) {
    return;
  }
  auto generation = generation_.load();

  WishlistJsRuntime::getInstance().accessRuntime([=](jsi::Runtime &rt) {
    if (generation_ != generation) {
      return;
    }

    if (dimensions.width != windowWidth_ || !names.empty() ||
        inflatorId != inflatorId_) {
      componentsPool_->setRegisteredViews(registeredViews);
      componentsPool_->setNames(names);

      itemProvider_ = std::static_pointer_cast<ItemProvider>(
          std::make_shared<WorkletItemProvider>(
              di_, dimensions.width, lc_, inflatorId));
      itemProvider_->setComponentsPool(componentsPool_);
      windowWidth_ = dimensions.width;
      inflatorId_ = inflatorId;
    } else {
      std::set<int> dirty =
          di_.lock()->getDataBinding()->applyChangesAndGetDirtyIndices(
              {window_[0].index, window_.back().index});
      for (auto &item : window_) {
        if (dirty.count(item.index) > 0) {
          item.dirty = true;
        }
      }
    }

    contentOffset_ = contentOffset;
    windowHeight_ = dimensions.height;

    updateWindow();
  });
}

void MGViewportCarerImpl::updateWindow() {
  float topEdge = contentOffset_ - windowHeight_;
  float bottomEdge = contentOffset_ + 2 * windowHeight_;
  bool startReached = false;
  bool endReached = false;

  assert(!window_.empty());
  
  float currentOffset = window_[0].offset;
  for (auto &item : window_) {
    if (item.dirty) {
      std::shared_ptr<ShadowNodeBinding> prevSn = nullptr;
      if (item.sn) {
        prevSn = std::make_shared<ShadowNodeBinding>(
            item.sn, componentsPool_, item.type, item.key);
      }
      WishItem wishItem = itemProvider_->provide(item.index, prevSn);
      if (wishItem.sn == nullptr) {
        continue;
      }
      swap(item.sn, wishItem.sn);
      item.offset = currentOffset - (wishItem.height - item.height);
      item.height = wishItem.height;
      item.type = wishItem.type;
      item.key = wishItem.key;
      item.dirty = false;
    }
    currentOffset = item.offset + item.height;
  }
  
  // Add above
  while (true) {
    WishItem item = window_.front();

    if (item.offset > topEdge) {
      WishItem wishItem = itemProvider_->provide(item.index - 1, nullptr);
      if (wishItem.sn == nullptr) {
        startReached = true;
        break;
      }
      wishItem.offset = item.offset - wishItem.height;
      window_.push_front(wishItem);
    } else {
      break;
    }
  }

  // Add below
  while (true) {
    WishItem item = window_.back();
    float bottom = item.offset + item.height;

    if (bottom < bottomEdge) {
      WishItem wishItem = itemProvider_->provide(item.index + 1, nullptr);
      if (wishItem.sn == nullptr) {
        endReached = true;
        break;
      }
      wishItem.offset = bottom;
      window_.push_back(wishItem);
    } else {
      break;
    }
  }

  std::vector<WishItem> itemsToRemove;

  // remove above
  while (true) {
    WishItem item = window_.front();
    float bottom = item.offset + item.height;
    if (bottom <= topEdge) {
      window_.pop_front();
      itemsToRemove.push_back(item);
      continue;
    } else {
      break;
    }
  }

  // remove below
  while (true) {
    WishItem item = window_.back();
    if (item.offset >= bottomEdge) {
      window_.pop_back();
      itemsToRemove.push_back(item);
      continue;
    } else {
      break;
    }
  }

  // This will be used to adjust scroll position to maintain the visible content
  // position.
  float contentOffsetAdjustment = 0;
  
  // Make sure we don't have negative offsets, this can happen when
  // we are at the start of the list.
  if (window_.front().offset < 0) {
    contentOffsetAdjustment -= window_.front().offset;
    float currentOffset = 0;
    for (auto &item : window_) {
      item.offset = currentOffset;
      currentOffset = currentOffset + item.height;
    }
  }
  
  // We reach the start of the list and still have extra offset
  // we need to remove it so that the content size is exact and
  // the list stops scrolling correctly.
  if (startReached && window_.front().offset > 0) {
    contentOffsetAdjustment -= window_.front().offset;

    float currentOffset = 0;
    for (auto &item : window_) {
      item.offset = currentOffset;
      currentOffset = currentOffset + item.height;
    }
  }
  // We are no longer at the start of the list and don't have extra offset
  // we need to add it back.
  else if (!startReached && window_.front().offset <= 0) {
    auto newOffset = initialContentSize_ / 2;
    for (auto &item : window_) {
      item.offset += newOffset;
    }
    contentOffsetAdjustment += newOffset;
  }

  // If there is a content offset adjustment to be made we need to make
  // sure to discard incoming scroll events as their offset will be invalid.
  // This happens since scroll events come from the main thread and we are
  // on the wishlist thread.
  if (contentOffsetAdjustment != 0) {
    generation_++;
    contentOffset_ += contentOffsetAdjustment;
  }
  
  // If we are near the end don't add extra offset and use the actual content size.
  auto endContentSize = endReached ? 0 : initialContentSize_ / 2;
  updateContentSize(
      {windowWidth_, window_.back().offset + window_.back().height + endContentSize},
      contentOffset_);

  pushChildren();

  for (auto &item : itemsToRemove) {
    componentsPool_->returnToPool(item.sn);
  }

  if (startReached) {
    auto firstItemKey = window_.front().key;
    if (firstItemKey != firstItemKeyForStartReached_) {
      notifyAboutStartReached();
      firstItemKeyForStartReached_ = firstItemKey;
    }
  } else {
    firstItemKeyForStartReached_ = "";
  }
  if (endReached) {
    auto lastItemKey = window_.back().key;
    if (lastItemKey != lastItemKeyForEndReached_) {
      notifyAboutEndReached();
      lastItemKeyForEndReached_ = lastItemKey;
    }
  } else {
    lastItemKeyForEndReached_ = "";
  }
}

void MGViewportCarerImpl::updateContentSize(
    MGDims contentSize,
    float contentOffset) {
  auto listener = listener_.lock();
  if (!listener ||
      (contentSize.width == contentSize_.width &&
       contentSize.height == contentSize_.height)) {
    return;
  }

  contentSize_ = contentSize;

  di_.lock()->getUIScheduler()->scheduleOnUI(
      [this, listener, contentSize, contentOffset] {
        // We are updating the scroll position programatically here we want to make sure we
        // don't reprocess those as regular scroll events.
        updatingContentSize_ = true;
        listener->didChangeContentSize(contentSize, contentOffset);
        updatingContentSize_ = false;
      });
}

std::shared_ptr<ShadowNode> MGViewportCarerImpl::getOffseter(float offset) {
  std::shared_ptr<const YogaLayoutableShadowNode> offseterTemplate =
      std::static_pointer_cast<const YogaLayoutableShadowNode>(
          componentsPool_->getNodeForType("__offsetComponent"));

  auto &cd = offseterTemplate->getComponentDescriptor();
  PropsParserContext propsParserContext{
      surfaceId_, *cd.getContextContainer().get()};

  // todo remove color
  folly::dynamic props = folly::dynamic::object;
  props["height"] = offset;
  props["width"] = windowWidth_;
  props["backgroundColor"] = 0x00001111;

  Props::Shared newProps = cd.cloneProps(
      propsParserContext, offseterTemplate->getProps(), RawProps(props));

  return offseterTemplate->clone({newProps, nullptr, nullptr});
}

void MGViewportCarerImpl::pushChildren() {
  std::shared_ptr<ShadowNode> sWishList = wishListNode_;
  if (sWishList == nullptr) {
    return;
  }

  MGUIManagerHolder::getInstance()
      .getUIManager()
      ->getShadowTreeRegistry()
      .visit(surfaceId_, [&](const ShadowTree &st) {
        ShadowTreeCommitTransaction transaction =
            [&](RootShadowNode const &oldRootShadowNode)
            -> std::shared_ptr<RootShadowNode> {
          return std::static_pointer_cast<RootShadowNode>(
              oldRootShadowNode.cloneTree(
                  sWishList->getFamily(),
                  [&](const ShadowNode &sn) -> std::shared_ptr<ShadowNode> {
                    auto children =
                        std::make_shared<ShadowNode::ListOfShared>();

                    children->push_back(getOffseter(window_[0].offset));

                    for (WishItem &wishItem : window_) {
                      if (wishItem.sn != nullptr) {
                        children->push_back(wishItem.sn);
                      }
                    }

                    auto contentContainer = std::static_pointer_cast<
                        const MGContentContainerShadowNode>(
                        sn.getChildren()[0]);

                    // TODO: This solution seems a little bit hacky still.
                    // We need to update most recent state before creating
                    // cloning the shadow node as it will be used to initialize
                    // children.
                    auto stateData =
                        std::make_shared<MGContentContainerState>(children);
                    auto state = std::make_shared<
                        MGContentContainerShadowNode::ConcreteState>(
                        stateData, *contentContainer->getState());
                    contentContainer->getFamily().setMostRecentState(state);

                    auto newContentContainer =
                        std::static_pointer_cast<MGContentContainerShadowNode>(
                            contentContainer->clone(
                                {nullptr, children, nullptr}));

                    newContentContainer->setWishlistChildren(children);

                    auto wishlistChildren =
                        std::make_shared<ShadowNode::ListOfShared>(
                            ShadowNode::ListOfShared{newContentContainer});

                    return sn.clone(
                        ShadowNodeFragment{nullptr, wishlistChildren, nullptr});
                  }));
        };
        st.commit(transaction, {});
      });

  notifyAboutPushedChildren();
}

// TODO That could cause a lag we may need to push it through state
void MGViewportCarerImpl::notifyAboutPushedChildren() {
  auto listener = listener_.lock();
  if (listener != nullptr) {
    std::vector<Item> newWindow;
    for (auto &item : window_) {
      newWindow.push_back({item.offset, item.height, item.index, item.key});
    }
    di_.lock()->getUIScheduler()->scheduleOnUI([newWindow, listener]() {
      listener->didPushChildren(std::move(newWindow));
    });
    WishlistJsRuntime::getInstance().accessRuntime([=](jsi::Runtime &rt) {
      jsi::Function didPushChildren =
          rt.global()
              .getPropertyAsObject(rt, "global")
              .getPropertyAsObject(rt, "__wishlistInflatorRegistry")
              .getPropertyAsFunction(rt, "didPushChildren");
      didPushChildren.call(rt, 0);
    });
  }
}

void MGViewportCarerImpl::notifyAboutStartReached() {
  wishListNode_->getConcreteEventEmitter().onStartReached({});
}

void MGViewportCarerImpl::notifyAboutEndReached() {
  wishListNode_->getConcreteEventEmitter().onEndReached({});
}

}; // namespace Wishlist
