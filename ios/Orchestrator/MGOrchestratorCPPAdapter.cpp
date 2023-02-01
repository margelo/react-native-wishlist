//
//  MGOrchestratorCPPAdapter.cpp
//  CocoaAsyncSocket
//
//  Created by Szymon on 14/01/2023.
//

#include "MGOrchestratorCPPAdapter.hpp"

MGOrchestratorCppAdapter::MGOrchestratorCppAdapter(std::function<void(float, float)> _onBoundingBoxDidChange,
                                                   std::function<void()> _onRequestVSync):
                                                    onBoundingBoxDidChange(_onBoundingBoxDidChange),
                                                    onRequestVSync(_onRequestVSync)
{

}

void MGOrchestratorCppAdapter::boundingBoxDidChange(std::pair<float, float> topAndBottomEdges) {
    onBoundingBoxDidChange(topAndBottomEdges.first, topAndBottomEdges.second);
}

void MGOrchestratorCppAdapter::requestVSync() {
    onRequestVSync();
}
