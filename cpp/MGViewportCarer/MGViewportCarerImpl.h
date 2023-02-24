#pragma once

#include <stdio.h>
#include <deque>
#include <iostream>
#include <set>
#include "ItemProvider.h"
// Temporary solution only for PoC
#include <react/renderer/uimanager/UIManager.h>
#include "MGDI.hpp"
#include "MGViewportCarer.hpp"

#ifdef ANDROID
class KeyClassHolder {
 public:
  static ShadowTreeRegistry *shadowTreeRegistry;
};
#endif

using namespace Wishlist;
// TODO make this class testable by injecting componentsPool and itemProvider
// or their factories
struct MGViewportCarerImpl : MGViewportCarer {
  float offset;
  float windowHeight;
  float windowWidth;
  int surfaceId;
  int initialIndex;
  std::string inflatorId;

  std::shared_ptr<ComponentsPool> componentsPool =
      std::make_shared<ComponentsPool>();
  std::shared_ptr<ItemProvider> itemProvider;
  std::deque<WishItem> window;
  std::shared_ptr<ShadowNode> wishListNode;
  LayoutContext lc;
  ShadowNode::SharedListOfShared wishlistChildren =
      std::make_shared<ShadowNode::ListOfShared>();

  std::weak_ptr<MGDI> di;

  void setInitialValues(
      std::shared_ptr<ShadowNode> wishListNode,
      LayoutContext lc);
  void setDI(std::weak_ptr<MGDI> _di);

  virtual void initialRenderAsync(
      MGDims dimensions,
      float intialOffset,
      int originItem,
      std::vector<std::shared_ptr<ShadowNode const>> registeredViews,
      std::vector<std::string> names,
      std::string inflatorId);

  virtual void didScrollAsync(
      MGDims dimentions,
      std::vector<std::shared_ptr<ShadowNode const>> registeredViews,
      std::vector<std::string> names,
      float newOffset,
      std::string inflatorId);

  void updateWindow();

  std::shared_ptr<ShadowNode> getOffseter(float offset);

  void pushChildren();

  void notifyAboutPushedChildren();
};
