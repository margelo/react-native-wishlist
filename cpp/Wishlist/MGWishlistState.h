#pragma once

#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/graphics/Geometry.h>

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
  //
  int revision;
  //
  double originContentOffset = 50000;
  int originItemIndex = 10; // Hardcode for now
  std::shared_ptr<MGViewportCarerImpl> viewportCarer =
      std::make_shared<MGViewportCarerImpl>();
  bool initialised = false;
  Rect contentBoundingRect;

  virtual ~MGWishlistState();

#ifdef ANDROID
  MGWishlistState();
  MGWishlistState(MGWishlistState const &previousState, folly::dynamic data);
  folly::dynamic getDynamic() const;
  MapBuffer getMapBuffer() const;

#endif
};

} // namespace react
} // namespace facebook
