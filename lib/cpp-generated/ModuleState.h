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

namespace facebook {
namespace react {

//class ModuleShadowNode;

/*
 * State for <ScrollView> component.
 */
class ModuleState final {
 public:
    double originContentOffset;
    int originItemIndex;
    std::weak_ptr<ShadowNode> weakSn;

#ifdef ANDROID
  ModuleState() = default;
  ModuleState(Mod const &previousState, folly::dynamic data)
      : contentOffset(
            {(Float)data["contentOffsetLeft"].getDouble(),
             (Float)data["contentOffsetTop"].getDouble()}),
        contentBoundingRect({}),
        scrollAwayPaddingTop((Float)data["scrollAwayPaddingTop"].getDouble()){};

  folly::dynamic getDynamic() const {
    return folly::dynamic::object("contentOffsetLeft", contentOffset.x)(
        "contentOffsetTop", contentOffset.y)(
        "scrollAwayPaddingTop", scrollAwayPaddingTop);
  };
  MapBuffer getMapBuffer() const {
    return MapBufferBuilder::EMPTY();
  };
#endif
};

} // namespace react
} // namespace facebook
