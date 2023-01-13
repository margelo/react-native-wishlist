//
//  MGDIImpl.hpp
//  MGWishList
//
//  Created by Szymon on 13/01/2023.
//

#ifndef MGDIImpl_hpp
#define MGDIImpl_hpp

#include <stdio.h>
#include "MGDI.hpp"
#include "MGWindowKeeper.hpp"
#include "MGDataBindingImpl.hpp"
#include "MGOrchestratorCPPAdapter.hpp"
#include "MGViewportCarerImpl.h"
#include "MGUIScheduleriOS.hpp"
#include <memory>

struct MGDIImpl : MGDI, std::enable_shared_from_this<MGDIImpl> {
    std::shared_ptr<MGWindowKeeper> windowKeeper;
    std::shared_ptr<MGDataBindingImpl> dataBinding;
    std::shared_ptr<MGOrchestratorCppAdapter> orchestratorAdapter;
    std::shared_ptr<MGViewportCarerImpl> viewportCarerImpl;
    std::shared_ptr<MGUIScheduler> uiScheduler;
    
    virtual std::shared_ptr<MGAnimationSight> getAnimationsSight() override;
    virtual std::shared_ptr<MGDataBinding> getDataBinding() override;
    virtual std::shared_ptr<MGVSyncRequester> getVSyncRequester() override;
    virtual std::shared_ptr<MGPushChildrenListener> getPushChildrenListener() override;
    virtual std::shared_ptr<MGViewportCarer> getViewportCarer() override;
    virtual std::shared_ptr<MGUIScheduler> getUIScheduler() override;
    virtual std::shared_ptr<MGBoundingBoxObserver> getBoundingBoxObserver() override;
    
    void setWindowKeeper(std::shared_ptr<MGWindowKeeper> wk);
    void setDataBindingImpl(std::shared_ptr<MGDataBindingImpl> dataBinding);
    void setOrchestratorCppAdaper(std::shared_ptr<MGOrchestratorCppAdapter> orchestratorAdapter);
    void setViewportCarerImpl(std::shared_ptr<MGViewportCarerImpl> viewportCarerImpl);
    void setUIScheduler(std::shared_ptr<MGUIScheduler> uiScheduler);
    
    std::weak_ptr<MGDI> getWeak();
    
    virtual ~MGDIImpl();
};

#endif /* MGDIImpl_hpp */
