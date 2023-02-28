#include "MGTemplateContainerState.h"

#ifdef ANDROID
#include "JNIStateRegistry.h"
#endif

namespace facebook::react {

const std::vector<std::shared_ptr<ShadowNode const>>
    &MGTemplateContainerState::getTemplates() const {
  return templates_;
}

#ifdef ANDROID

folly::dynamic MGTemplateContainerState::getDynamic() const {
  auto templatesRef =
      Wishlist::JNIStateRegistry::getInstance().addValue((void *)&templates_);
  return folly::dynamic::object("templates", templatesRef);
};

#endif

} // namespace facebook::react
