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

namespace Wishlist {

class MGDIImpl : public MGDI, public std::enable_shared_from_this<MGDIImpl> {
 public:
  std::shared_ptr<MGDataBinding> getDataBinding() override;
  std::shared_ptr<MGVSyncRequester> getVSyncRequester() override;
  std::shared_ptr<MGPushChildrenListener> getPushChildrenListener() override;
  std::shared_ptr<MGViewportCarer> getViewportCarer() override;
  std::shared_ptr<MGUIScheduler> getUIScheduler() override;
  std::shared_ptr<MGErrorHandler> getErrorHandler() override;

  void setDataBinding(const std::shared_ptr<MGDataBinding> &db);
  void setVSyncRequester(const std::shared_ptr<MGVSyncRequester> &vr);
  void setPushChildrenListener(
      const std::shared_ptr<MGPushChildrenListener> &pcl);
  void setViewportCarer(const std::shared_ptr<MGViewportCarer> &vc);
  void setUIScheduler(const std::shared_ptr<MGUIScheduler> &us);
  void setErrorHandler(const std::shared_ptr<MGErrorHandler> &eh);

  std::weak_ptr<MGDI> getWeak();

  virtual ~MGDIImpl();

 private:
  std::shared_ptr<MGDataBinding> dataBinding_;
  std::shared_ptr<MGVSyncRequester> vSyncRequester_;
  std::shared_ptr<MGPushChildrenListener> pushChildrenListener_;
  std::shared_ptr<MGViewportCarer> viewportCarer_;
  std::shared_ptr<MGUIScheduler> uiScheduler_;
  std::shared_ptr<MGErrorHandler> errorHandler_;
};

}; // namespace Wishlist
