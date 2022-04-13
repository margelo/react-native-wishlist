/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once

#include <react/renderer/graphics/Geometry.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>

#ifdef ANDROID
#include <folly/dynamic.h>
#include <react/renderer/mapbuffer/MapBuffer.h>
#include <react/renderer/mapbuffer/MapBufferBuilder.h>
#endif

#include "ComponentsPool.h"
#include "ViewportObserver.hpp"

namespace facebook {
namespace react {

//class WishlistShadowNode;

/*
 * State for <ScrollView> component.
 */
class WishlistState final {
 public:
    double originContentOffset = 50000;
    int originItemIndex = 10; // Hardcode for now
    std::shared_ptr<ViewportObserver> viewportObserver;
    virtual ~WishlistState();

#ifdef ANDROID
  WishlistState();
  WishlistState(WishlistState const &previousState, folly::dynamic data);
  folly::dynamic getDynamic() const;
  MapBuffer getMapBuffer() const;
  
#endif
};

} // namespace react
} // namespace facebook
