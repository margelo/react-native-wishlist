//
//  MGDIImpl.cpp
//  MGWishList
//
//  Created by Szymon on 13/01/2023.
//

#include "MGDIImpl.hpp"

#include <iostream>

namespace Wishlist {

std::shared_ptr<MGDataBinding> MGDIImpl::getDataBinding() {
  return dataBinding_;
}

std::shared_ptr<MGVSyncRequester> MGDIImpl::getVSyncRequester() {
  return vSyncRequester_;
}

std::shared_ptr<MGViewportCarer> MGDIImpl::getViewportCarer() {
  return viewportCarer_;
}

std::shared_ptr<MGUIScheduler> MGDIImpl::getUIScheduler() {
  return uiScheduler_;
};

std::shared_ptr<MGErrorHandler> MGDIImpl::getErrorHandler() {
  return errorHandler_;
}

void MGDIImpl::setDataBinding(const std::shared_ptr<MGDataBinding> &db) {
  dataBinding_ = db;
}

void MGDIImpl::setVSyncRequester(const std::shared_ptr<MGVSyncRequester> &vr) {
  vSyncRequester_ = vr;
}

void MGDIImpl::setPushChildrenListener(
    const std::shared_ptr<MGViewportCarerListener> &pcl) {
  pushChildrenListener_ = pcl;
}

void MGDIImpl::setViewportCarer(const std::shared_ptr<MGViewportCarer> &vc) {
  viewportCarer_ = vc;
}

void MGDIImpl::setUIScheduler(const std::shared_ptr<MGUIScheduler> &us) {
  uiScheduler_ = us;
}

void MGDIImpl::setErrorHandler(const std::shared_ptr<MGErrorHandler> &eh) {
  errorHandler_ = eh;
}

std::weak_ptr<MGDI> MGDIImpl::getWeak() {
  return weak_from_this();
}

MGDIImpl::~MGDIImpl() {}

}; // namespace Wishlist
