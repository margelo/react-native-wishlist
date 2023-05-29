#pragma once

#include <react/renderer/core/ShadowNode.h>
#include <vector>

#ifdef ANDROID
#include <folly/dynamic.h>
#include <react/renderer/mapbuffer/MapBuffer.h>
#include <react/renderer/mapbuffer/MapBufferBuilder.h>
#endif

namespace facebook {
namespace react {

class JSI_EXPORT MGTemplateContainerState final {
 public:
  MGTemplateContainerState(){};
  MGTemplateContainerState(
      std::vector<std::shared_ptr<ShadowNode const>> const &templates)
      : templates_(templates){};

  const std::vector<std::shared_ptr<ShadowNode const>> &getTemplates() const;

#ifdef ANDROID
  MGTemplateContainerState(
      MGTemplateContainerState const &previousState,
      folly::dynamic data){};

  folly::dynamic getDynamic() const;

  MapBuffer getMapBuffer() const {
    return MapBufferBuilder::EMPTY();
  };
#endif

 private:
  std::vector<std::shared_ptr<ShadowNode const>> templates_;
};

} // namespace react
} // namespace facebook
