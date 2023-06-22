//
//  MGDI.hpp
//  MGWishList
//
//  Created by Szymon on 13/01/2023.
//

#pragma once

#include <react/renderer/uimanager/UIManager.h>
#include <stdio.h>

#include "MGBindingProvider.hpp"
#include "MGDataBinding.hpp"
#include "MGErrorHandler.h"
#include "MGUIScheduler.hpp"
#include "MGVSyncRequester.hpp"
#include "MGViewportCarer.hpp"
#include "MGViewportCarerListener.hpp"

namespace Wishlist {

struct MGDI {
  virtual std::shared_ptr<MGDataBinding> getDataBinding() = 0;
  virtual std::shared_ptr<MGVSyncRequester> getVSyncRequester() = 0;
  virtual std::shared_ptr<MGViewportCarer> getViewportCarer() = 0;
  virtual std::shared_ptr<MGUIScheduler> getUIScheduler() = 0;
  virtual std::shared_ptr<MGErrorHandler> getErrorHandler() = 0;

  virtual ~MGDI() {}
};

}; // namespace Wishlist
