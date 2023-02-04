//
//  MGBoundingBoxObserver.hpp
//  MGWishList
//
//  Created by Szymon on 13/01/2023.
//

#ifndef MGBoundingBoxObserver_hpp
#define MGBoundingBoxObserver_hpp

#include <stdio.h>
#include <vector>

struct MGBoundingBoxObserver {
     virtual void boundingBoxDidChange(std::pair<float, float> TopAndBottomEdge) = 0;
};

#endif /* MGBoundingBoxObserver_hpp */
