//
//  MGVsyncRequester.hpp
//  MGWishList
//
//  Created by Szymon on 13/01/2023.
//

#ifndef MGVsyncRequester_hpp
#define MGVsyncRequester_hpp

#include <stdio.h>

struct MGVSyncRequester {
  virtual void requestVSync() = 0;
};

#endif /* MGVsyncRequester_hpp */
