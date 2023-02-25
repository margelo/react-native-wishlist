#include "MGTemplateContainerState.h"

#include <cstdint>

namespace facebook::react {

const std::vector<std::shared_ptr<ShadowNode const>>
    &MGTemplateContainerState::getTemplates() const {
  return templates_;
}

folly::dynamic MGTemplateContainerState::getDynamic() const {
  return folly::dynamic::object("templates", (std::uintptr_t)&templates_);
};

} // namespace facebook::react
