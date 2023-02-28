//
//  MGOrchestratorCPPAdapter.hpp
//  CocoaAsyncSocket
//
//  Created by Szymon on 14/01/2023.
//

#pragma once

#include <stdio.h>
#include "MGBoundingBoxObserver.hpp"
#include "MGVSyncRequester.hpp"

namespace Wishlist {

struct MGOrchestratorCppAdapter final : MGVSyncRequester,
                                        MGBoundingBoxObserver {
  std::function<void(float, float)> onBoundingBoxDidChange;
  std::function<void()> onRequestVSync;

  MGOrchestratorCppAdapter(
      std::function<void(float, float)> onBoundingBoxDidChange,
      std::function<void()> onRequestVSync);

  void boundingBoxDidChange(std::pair<float, float> topAndBottomEdges) override;

  void requestVSync() override;
};

}; // namespace Wishlist
