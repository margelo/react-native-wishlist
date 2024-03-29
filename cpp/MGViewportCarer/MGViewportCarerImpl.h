#pragma once

#include <react/renderer/uimanager/UIManager.h>
#include <stdio.h>
#include <deque>
#include <iostream>
#include <set>
#include "ItemProvider.h"
#include "MGDI.hpp"
#include "MGViewportCarer.hpp"

namespace facebook::react {
class MGWishlistShadowNode;
};

namespace Wishlist {

// TODO make this class testable by injecting componentsPool and itemProvider
// or their factories
class MGViewportCarerImpl final : public MGViewportCarer {
 public:
  MGViewportCarerImpl();

  void setInitialValues(
      const std::shared_ptr<MGWishlistShadowNode> &wishListNode,
      const LayoutContext &lc);

  void setDI(const std::weak_ptr<MGDI> &_di);

  void setListener(const std::weak_ptr<MGViewportCarerListener> &listener);

  void initialRenderAsync(
      MGDims dimensions,
      float initialContentSize,
      int originItem,
      const std::vector<std::shared_ptr<ShadowNode const>> &registeredViews,
      const std::vector<std::string> &names,
      const std::string &inflatorId) override;

  void didScrollAsync(
      MGDims dimensions,
      float contentOffset,
      const std::string &inflatorId) override;

  void didUpdateContentOffset() override;

 private:
  void updateWindow();

  void updateContentOffset(float contentOffset);

  std::shared_ptr<ShadowNode> getOffseter(float offset);

  void pushChildren(float contentOffset);

  void notifyAboutPushedChildren();

  void notifyAboutStartReached();

  void notifyAboutEndReached();

  float contentOffset_;
  float initialContentSize_;
  float windowHeight_;
  float windowWidth_;
  int surfaceId_;
  std::string inflatorId_;
  std::shared_ptr<ComponentsPool> componentsPool_;
  std::shared_ptr<ItemProvider> itemProvider_;
  std::deque<WishItem> window_;
  std::shared_ptr<MGWishlistShadowNode> wishListNode_;
  LayoutContext lc_;
  std::weak_ptr<MGDI> di_;
  std::string firstItemKeyForStartReached_;
  std::string lastItemKeyForEndReached_;
  std::weak_ptr<MGViewportCarerListener> listener_;
  bool ignoreScrollEvents_;
};

}; // namespace Wishlist
