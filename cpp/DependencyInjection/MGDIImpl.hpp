//
//  MGDIImpl.hpp
//  MGWishList
//
//  Created by Szymon on 13/01/2023.
//

#pragma once

#include <stdio.h>
#include <memory>
#include "MGDI.hpp"
#include "MGDataBindingImpl.hpp"
#include "MGOrchestratorCPPAdapter.hpp"
#include "MGUIScheduler.hpp"
#include "MGViewportCarerImpl.h"
#include "MGWindowKeeper.hpp"

namespace Wishlist {

class MGDIImpl : public MGDI, public std::enable_shared_from_this<MGDIImpl> {
 public:
  std::shared_ptr<MGAnimationSight> getAnimationsSight() override;
  std::shared_ptr<MGDataBinding> getDataBinding() override;
  std::shared_ptr<MGVSyncRequester> getVSyncRequester() override;
  std::shared_ptr<MGPushChildrenListener> getPushChildrenListener() override;
  std::shared_ptr<MGViewportCarer> getViewportCarer() override;
  std::shared_ptr<MGUIScheduler> getUIScheduler() override;
  std::shared_ptr<MGBoundingBoxObserver> getBoundingBoxObserver() override;
  std::shared_ptr<MGErrorHandler> getErrorHandler() override;

  void setWindowKeeper(std::shared_ptr<MGWindowKeeper> wk);
  void setDataBindingImpl(std::shared_ptr<MGDataBindingImpl> dataBinding);
  void setOrchestratorCppAdaper(
      std::shared_ptr<MGOrchestratorCppAdapter> orchestratorAdapter);
  void setViewportCarerImpl(
      std::shared_ptr<MGViewportCarerImpl> viewportCarerImpl);
  void setUIScheduler(std::shared_ptr<MGUIScheduler> uiScheduler);
  void setErrorHandler(std::shared_ptr<MGErrorHandler> errorHandler);

  std::weak_ptr<MGDI> getWeak();

  virtual ~MGDIImpl();

 private:
  std::shared_ptr<MGWindowKeeper> windowKeeper;
  std::shared_ptr<MGDataBindingImpl> dataBinding;
  std::shared_ptr<MGOrchestratorCppAdapter> orchestratorAdapter;
  std::shared_ptr<MGViewportCarerImpl> viewportCarerImpl;
  std::shared_ptr<MGUIScheduler> uiScheduler;
  std::shared_ptr<MGErrorHandler> errorHandler;
};

}; // namespace Wishlist
