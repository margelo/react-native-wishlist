//
//  MGOrchestratorCPPAdapter.hpp
//  CocoaAsyncSocket
//
//  Created by Szymon on 14/01/2023.
//

#ifndef MGOrchestratorCPPAdapter_hpp
#define MGOrchestratorCPPAdapter_hpp

#include <stdio.h>
#include "MGBoundingBoxObserver.hpp"
#include "MGVSyncRequester.hpp"

struct MGOrchestratorCppAdapter : MGVSyncRequester, MGBoundingBoxObserver {
  std::function<void(float, float)> onBoundingBoxDidChange;
  std::function<void()> onRequestVSync;

  MGOrchestratorCppAdapter(
      std::function<void(float, float)> onBoundingBoxDidChange,
      std::function<void()> onRequestVSync);

  virtual void boundingBoxDidChange(
      std::pair<float, float> topAndBottomEdges) override;

  virtual void requestVSync() override;
};

#endif /* MGOrchestratorCPPAdapter_hpp */
