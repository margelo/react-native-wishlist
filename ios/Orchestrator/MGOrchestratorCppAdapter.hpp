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
      std::function<void(std::vector<Item> items)> didPushChildren,
      std::function<void(MGDims contentSize, float contentOffset)>
          didChangeContentSize);

 private:
  void didPushChildren(std::vector<Item> newWindow) override;
  void didChangeContentSize(MGDims contentSize, float contentOffset) override;
  void requestVSync() override;

  std::function<void()> onRequestVSync_;
  std::function<void(std::vector<Item> items)> didPushChildren_;
  std::function<void(MGDims contentSize, float contentOffset)>
      didChangeContentSize_;
};

}; // namespace Wishlist
