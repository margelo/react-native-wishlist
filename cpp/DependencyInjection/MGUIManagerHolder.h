#pragma once

#include <react/renderer/uimanager/UIManager.h>

using namespace facebook::react;

namespace Wishlist {

class MGUIManagerHolder {
 public:
  static MGUIManagerHolder &getInstance();

  std::shared_ptr<UIManager> getUIManager() const;
  void setUIManager(std::shared_ptr<UIManager> uiManager);

 private:
  MGUIManagerHolder();
  MGUIManagerHolder(const MGUIManagerHolder &) = delete;
  MGUIManagerHolder &operator=(const MGUIManagerHolder &) = delete;

  std::shared_ptr<UIManager> uiManager_;
};

}; // namespace Wishlist
