#pragma once

#include <React-Fabric/react/renderer/uimanager/UIManager.h>

using namespace facebook::react;

namespace Wishlist {

class MGUIManagerHolder {
 public:
  static MGUIManagerHolder &getInstance();

  std::shared_ptr<UIManager> getUIManager() const;
  void setUIManager(const std::shared_ptr<UIManager> &uiManager);

 private:
  MGUIManagerHolder();
  MGUIManagerHolder(const MGUIManagerHolder &) = delete;
  MGUIManagerHolder &operator=(const MGUIManagerHolder &) = delete;

  std::shared_ptr<UIManager> uiManager_;
};

}; // namespace Wishlist
