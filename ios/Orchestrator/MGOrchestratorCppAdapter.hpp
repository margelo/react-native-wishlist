//
//  MGOrchestratorCppAdapter.hpp
//  CocoaAsyncSocket
//
//  Created by Szymon on 14/01/2023.
//

#pragma once

#include <stdio.h>
#include <functional>
#include "MGVSyncRequester.hpp"
#include "MGViewportCarerListener.hpp"

namespace Wishlist {

class MGOrchestratorCppAdapter final : public MGVSyncRequester,
                                       public MGViewportCarerListener {
 public:
  MGOrchestratorCppAdapter(
      std::function<void()> onRequestVSync,
      std::function<void(std::vector<Item> items)> didPushChildren);

 private:
  void didPushChildren(std::vector<Item> newWindow) override;
  void requestVSync() override;

  std::function<void()> onRequestVSync_;
  std::function<void(std::vector<Item> items)> didPushChildren_;
};

}; // namespace Wishlist
