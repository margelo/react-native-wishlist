#pragma once

#include <ReactCommon/JavaTurboModule.h>
#include <ReactCommon/TurboModule.h>
#include <jsi/jsi.h>
#include "MGTemplateContainerComponentDescriptor.h"
#include "MGWishlistComponentDescriptor.h"

namespace facebook {
namespace react {

JSI_EXPORT
std::shared_ptr<TurboModule> wishlist_ModuleProvider(
    const std::string &moduleName,
    const JavaTurboModule::InitParams &params);

} // namespace react
} // namespace facebook
