#pragma once

#include <string>
#include "MGErrorHandler.h"

namespace Wishlist {

class ErrorHandlerAndroid final : public MGErrorHandler {
 public:
  void reportError(const std::string &message) override;
};

} // namespace Wishlist
