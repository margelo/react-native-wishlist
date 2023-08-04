//
//  MGOrchestratorCppAdapter.cpp
//  CocoaAsyncSocket
//
//  Created by Szymon on 14/01/2023.
//

#include "MGOrchestratorCppAdapter.hpp"

namespace Wishlist {

MGOrchestratorCppAdapter::MGOrchestratorCppAdapter(
    std::function<void()> onRequestVSync,
    std::function<void(std::vector<Item> items)> didPushChildren,
    std::function<void(MGDims contentSize, float contentOffset)>
        didChangeContentSize)
    : onRequestVSync_(onRequestVSync),
      didPushChildren_(didPushChildren),
      didChangeContentSize_(didChangeContentSize) {}

void MGOrchestratorCppAdapter::didPushChildren(std::vector<Item> newWindow) {
  didPushChildren_(std::move(newWindow));
}

void MGOrchestratorCppAdapter::didChangeContentSize(
    MGDims contentSize,
    float contentOffset) {
  didChangeContentSize_(contentSize, contentOffset);
}

void MGOrchestratorCppAdapter::requestVSync() {
  onRequestVSync_();
}

}; // namespace Wishlist
