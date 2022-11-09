#include "MGTemplateContainerState.h"

namespace facebook::react {

const std::vector<std::shared_ptr<ShadowNode const>>
    &MGTemplateContainerState::getTemplates() const {
  return templates_;
}

} // namespace facebook::react
