//
//  MGViewportCarer.hpp
//  MGWishList
//
//  Created by Szymon on 13/01/2023.
//

#pragma once

#include <react/renderer/uimanager/UIManager.h>
#include <stdio.h>

namespace Wishlist {

using namespace facebook::react;

static float MG_NO_OFFSET = std::numeric_limits<float>::min();

struct MGDims {
  float width;
  float height;
};

class MGViewportCarer {
 public:
  virtual void initialRenderAsync(
      MGDims dimensions,
      float initialContentSize,
      int originItem,
      const std::vector<std::shared_ptr<ShadowNode const>> &registeredViews,
      const std::vector<std::string> &names,
      const std::string &inflatorId) = 0;

  virtual void didScrollAsync(
      MGDims dimensions,
      float contentOffset,
      const std::string &inflatorId) = 0;

  virtual void didUpdateContentOffset() = 0;
};

}; // namespace Wishlist
