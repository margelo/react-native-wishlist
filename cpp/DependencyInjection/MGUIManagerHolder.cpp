#include "MGUIManagerHolder.h"

namespace Wishlist {

MGUIManagerHolder &MGUIManagerHolder::getInstance() {
  static MGUIManagerHolder instance;
  return instance;
}

MGUIManagerHolder::MGUIManagerHolder() : uiManager_(nullptr) {}

std::shared_ptr<UIManager> MGUIManagerHolder::getUIManager() const {
  return uiManager_;
}

void MGUIManagerHolder::setUIManager(std::shared_ptr<UIManager> uiManager) {
  uiManager_ = uiManager;
}

}; // namespace Wishlist
