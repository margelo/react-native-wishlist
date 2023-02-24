//
//  MGDI.hpp
//  MGWishList
//
//  Created by Szymon on 13/01/2023.
//

#ifndef MGDI_hpp
#define MGDI_hpp

#include <stdio.h>
#include "MGAnimationSight.hpp"
#include "MGBoundingBoxObserver.hpp"
#include "MGDataBinding.hpp"
#include "MGVSyncRequester.hpp"
#include "MGPushChildrenListener.hpp"
#include "MGViewportCarer.hpp"
#include "MGUIScheduler.hpp"
#include "MGBindingProvider.hpp"


struct MGDI {
    virtual std::shared_ptr<MGAnimationSight> getAnimationsSight() = 0;
    virtual std::shared_ptr<MGDataBinding> getDataBinding() = 0;
    virtual std::shared_ptr<MGVSyncRequester> getVSyncRequester() = 0;
    virtual std::shared_ptr<MGPushChildrenListener> getPushChildrenListener() = 0;
    virtual std::shared_ptr<MGViewportCarer> getViewportCarer() = 0;
    virtual std::shared_ptr<MGUIScheduler> getUIScheduler() = 0;
    virtual std::shared_ptr<MGBoundingBoxObserver> getBoundingBoxObserver() = 0;

    virtual ~MGDI(){}
};

#endif /* MGDI_hpp */
