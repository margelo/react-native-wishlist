#pragma once

#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/graphics/Rect.h>

#ifdef ANDROID
#include <folly/dynamic.h>
#include <react/renderer/mapbuffer/MapBuffer.h>
#include <react/renderer/mapbuffer/MapBufferBuilder.h>
#endif

#include "ComponentsPool.h"
#include "MGViewportCarerImpl.h"

using namespace Wishlist;

namespace facebook {
namespace react {

// class WishlistShadowNode;

/*
 * State for <ScrollView> component.
 */
class JSI_EXPORT MGWishlistState final {
 public:
  bool initialised;
  std::shared_ptr<MGViewportCarerImpl> viewportCarer;
  Rect contentBoundingRect;
  float contentOffset;

  MGWishlistState();

#ifdef ANDROID
  MGWishlistState(MGWishlistState const &previousState, folly::dynamic data);
  folly::dynamic getDynamic() const;
  MapBuffer getMapBuffer() const;
#endif
};

} // namespace react
} // namespace facebook
