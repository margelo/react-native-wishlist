//
//  MGDIImpl.cpp
//  MGWishList
//
//  Created by Szymon on 13/01/2023.
//

#include "MGDIImpl.hpp"

#include <iostream>

namespace Wishlist {

std::shared_ptr<MGAnimationSight> MGDIImpl::getAnimationsSight() {
  return std::static_pointer_cast<MGAnimationSight>(this->windowKeeper);
}

std::shared_ptr<MGDataBinding> MGDIImpl::getDataBinding() {
  return std::static_pointer_cast<MGDataBinding>(dataBinding);
}

std::shared_ptr<MGVSyncRequester> MGDIImpl::getVSyncRequester() {
  return orchestratorAdapter;
}

std::shared_ptr<MGPushChildrenListener> MGDIImpl::getPushChildrenListener() {
  return windowKeeper;
}

std::shared_ptr<MGViewportCarer> MGDIImpl::getViewportCarer() {
  return viewportCarerImpl;
}

std::shared_ptr<MGUIScheduler> MGDIImpl::getUIScheduler() {
  return uiScheduler;
};

std::shared_ptr<MGBoundingBoxObserver> MGDIImpl::getBoundingBoxObserver() {
  return orchestratorAdapter;
}

std::shared_ptr<MGErrorHandler> MGDIImpl::getErrorHandler() {
  return errorHandler;
}

void MGDIImpl::setWindowKeeper(std::shared_ptr<MGWindowKeeper> wk) {
  this->windowKeeper = wk;
}

void MGDIImpl::setDataBindingImpl(
    std::shared_ptr<MGDataBindingImpl> dataBinding) {
  this->dataBinding = dataBinding;
}

void MGDIImpl::setOrchestratorCppAdaper(
    std::shared_ptr<MGOrchestratorCppAdapter> orchestratorAdapter) {
  this->orchestratorAdapter = orchestratorAdapter;
}

void MGDIImpl::setViewportCarerImpl(
    std::shared_ptr<MGViewportCarerImpl> viewportCarerImpl) {
  this->viewportCarerImpl = viewportCarerImpl;
}

void MGDIImpl::setUIScheduler(std::shared_ptr<MGUIScheduler> uiScheduler) {
  this->uiScheduler = uiScheduler;
}

void MGDIImpl::setErrorHandler(std::shared_ptr<MGErrorHandler> errorHandler) {
  this->errorHandler = errorHandler;
}

std::weak_ptr<MGDI> MGDIImpl::getWeak() {
  return std::static_pointer_cast<MGDI>(shared_from_this());
}

MGDIImpl::~MGDIImpl() {
  std::cout << "sdfs" << std::endl;
}

}; // namespace Wishlist
