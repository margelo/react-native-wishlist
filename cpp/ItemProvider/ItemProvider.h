#pragma once

#include <react/renderer/uimanager/primitives.h>
#include <stdio.h>
#include <memory>
#include "ComponentsPool.h"

using namespace facebook::react;

namespace Wishlist {

struct WishItem {
  float offset;
  int index;
  std::string key;
  float height;
  bool dirty = false;
  std::shared_ptr<ShadowNode> sn;
};

class ItemProvider {
 public:
  float maxWidth = 0;
  LayoutConstraints lcc;
  LayoutContext lc;

  ItemProvider(float maxWidth, LayoutContext lc) {
    this->maxWidth = maxWidth;
    this->lc = lc;
    lcc.layoutDirection = facebook::react::LayoutDirection::LeftToRight;
    lcc.maximumSize.width = maxWidth;
  }

  virtual void setComponentsPool(std::shared_ptr<ComponentsPool> pool) = 0;

  virtual WishItem provide(int index) = 0;

  virtual ~ItemProvider() {}
};

struct WorkletItemProvider : ItemProvider {
  std::shared_ptr<ComponentsPool> cp;
  std::string tag;

  WorkletItemProvider(float maxWidth, LayoutContext lc, std::string tag)
      : ItemProvider(maxWidth, lc) {
    this->tag = tag;
  }

  void setComponentsPool(std::shared_ptr<ComponentsPool> pool) {
    cp = pool;
  }

  WishItem provide(int index);
};

}; // namespace Wishlist
