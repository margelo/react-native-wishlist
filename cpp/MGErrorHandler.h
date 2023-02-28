#pragma once

#include <string>

namespace Wishlist {

class MGErrorHandler {
 public:
  virtual void reportError(const std::string &message) = 0;
};

}; // namespace Wishlist
