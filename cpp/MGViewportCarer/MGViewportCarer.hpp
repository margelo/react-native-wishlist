//
//  MGViewportCarer.hpp
//  MGWishList
//
//  Created by Szymon on 13/01/2023.
//

#ifndef MGViewportCarer_hpp
#define MGViewportCarer_hpp

#include <stdio.h>
#include <react/renderer/uimanager/UIManager.h>

using namespace facebook::react;

struct MGDims {
    float width;
    float height;
};

struct MGViewportCarer {
    virtual void initialRenderAsync(MGDims dimensions,
                                  float intialOffset,
                                  int originItem,
                                  std::vector<std::shared_ptr<ShadowNode const>> registeredViews,
                                  std::vector<std::string> names,
                                  std::string inflatorId) = 0;
    
    virtual void didScrollAsync(MGDims dimentions, std::vector<std::shared_ptr<ShadowNode const>> registeredViews, std::vector<std::string> names, float newOffset, std::string inflatorId) = 0;
    
    virtual ~MGViewportCarer() {}
};

#endif /* MGViewportCarer_hpp */
