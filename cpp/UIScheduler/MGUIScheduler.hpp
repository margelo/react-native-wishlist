//
//  MGUIScheduler.hpp
//  CocoaAsyncSocket
//
//  Created by Szymon on 14/01/2023.
//

#ifndef MGUIScheduler_hpp
#define MGUIScheduler_hpp

#include <stdio.h>
#include <functional>

struct MGUIScheduler {
    virtual void scheduleOnUI(std::function<void()> && f) = 0;
};

#endif /* MGUIScheduler_hpp */
