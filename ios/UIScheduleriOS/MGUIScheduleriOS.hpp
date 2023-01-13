//
//  MGUIScheduleriOS.hpp
//  CocoaAsyncSocket
//
//  Created by Szymon on 14/01/2023.
//

#ifndef MGUIScheduleriOS_hpp
#define MGUIScheduleriOS_hpp

#include <stdio.h>
#include "MGUIScheduler.hpp"

struct MGUIScheduleriOS : MGUIScheduler {
    virtual void scheduleOnUI(std::function<void()> && f);
};

#endif /* MGUIScheduleriOS_hpp */
