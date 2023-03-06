//
//  MGDataBindingImpl.hpp
//  MGWishList
//
//  Created by Szymon on 16/01/2023.
//

#pragma once

#include <stdio.h>
#include <memory>
#include <set>
#include "MGDI.hpp"
#include "MGDataBinding.hpp"

namespace Wishlist {

struct MGDataBindingImpl : MGDataBinding {
  std::weak_ptr<MGDI> di;
  std::string _wishlistId;

  MGDataBindingImpl(
      const std::string &wishlistId,
      const std::weak_ptr<MGDI> &di);

  virtual std::set<int> applyChangesAndGetDirtyIndices(
      std::pair<int, int> windowIndexRange);

  void registerBindings();
  void unregisterBindings();

  virtual ~MGDataBindingImpl();
};

}; // namespace Wishlist
