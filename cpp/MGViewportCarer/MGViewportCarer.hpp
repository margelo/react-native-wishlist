//
//  MGViewportCarer.hpp
//  MGWishList
//
//  Created by Szymon on 13/01/2023.
//

#ifndef MGViewportCarer_hpp
#define MGViewportCarer_hpp

#include <react/renderer/uimanager/UIManager.h>
#include <stdio.h>

using namespace facebook::react;

struct MGDims {
  float width;
  float height;
};

class MGViewportCarer {
 public:
  virtual void initialRenderAsync(
      MGDims dimensions,
      float initialOffset,
      int originItem,
      const std::vector<std::shared_ptr<ShadowNode const>> &registeredViews,
      const std::vector<std::string> &names,
      const std::string &inflatorId) = 0;

  virtual void didScrollAsync(
      MGDims dimensions,
      const std::vector<std::shared_ptr<ShadowNode const>> &registeredViews,
      const std::vector<std::string> &names,
      float newOffset,
      const std::string &inflatorId) = 0;

  virtual ~MGViewportCarer() {}
};

#endif /* MGViewportCarer_hpp */
