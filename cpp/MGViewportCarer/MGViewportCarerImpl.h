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
class MGViewportCarerImpl : public MGViewportCarer {
 public:
  void setInitialValues(
      const std::shared_ptr<MGWishlistShadowNode> &wishListNode,
      const LayoutContext &lc);

  void setDI(const std::weak_ptr<MGDI> &_di);

  void setListener(const std::weak_ptr<MGViewportCarerListener> &listener);

  void initialRenderAsync(
      MGDims dimensions,
      float initialOffset,
      int originItem,
      const std::vector<std::shared_ptr<ShadowNode const>> &registeredViews,
      const std::vector<std::string> &names,
      const std::string &inflatorId) override;

  void didScrollAsync(
      MGDims dimensions,
      const std::vector<std::shared_ptr<ShadowNode const>> &registeredViews,
      const std::vector<std::string> &names,
      float newOffset,
      const std::string &inflatorId) override;

 private:
  void updateWindow();

  std::shared_ptr<ShadowNode> getOffseter(float offset);

  void pushChildren();

  void notifyAboutPushedChildren();

  void notifyAboutStartReached();

  void notifyAboutEndReached();

  float offset_;
  float windowHeight_;
  float windowWidth_;
  int surfaceId_;
  std::string inflatorId_;
  std::shared_ptr<ComponentsPool> componentsPool_ =
      std::make_shared<ComponentsPool>();
  std::shared_ptr<ItemProvider> itemProvider_;
  std::deque<WishItem> window_;
  std::shared_ptr<MGWishlistShadowNode> wishListNode_;
  LayoutContext lc_;
  std::weak_ptr<MGDI> di_;
  std::string firstItemKeyForStartReached_;
  std::string lastItemKeyForEndReached_;
  std::weak_ptr<MGViewportCarerListener> listener_;
};

}; // namespace Wishlist
