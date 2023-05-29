#pragma once

#include <string>
#include "MGErrorHandler.h"

namespace Wishlist {

class MGErrorHandlerIOS final : public MGErrorHandler {
 public:
  void reportError(const std::string &message) override;
};

} // namespace Wishlist
