#pragma once

#include <react/renderer/components/view/ConcreteViewShadowNode.h>

#ifdef ANDROID
#include <folly/dynamic.h>
#include <react/renderer/mapbuffer/MapBuffer.h>
#include <react/renderer/mapbuffer/MapBufferBuilder.h>
#endif

namespace facebook {
namespace react {

/*
 * State for <MGContentContainer> component.
 */
class JSI_EXPORT MGContentContainerState final {
 public:
  ShadowNode::SharedListOfShared wishlistChildren;

  MGContentContainerState();
  MGContentContainerState(
      const ShadowNode::SharedListOfShared &wishlistChildren);

#ifdef ANDROID
  MGContentContainerState(
      MGContentContainerState const &previousState,
      folly::dynamic data);
  folly::dynamic getDynamic() const;
  MapBuffer getMapBuffer() const;
#endif
};

} // namespace react
} // namespace facebook
