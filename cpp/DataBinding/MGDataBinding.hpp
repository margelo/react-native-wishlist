//
//  MGDataBinding.hpp
//  MGWishList
//
//  Created by Szymon on 13/01/2023.
//

#pragma once

#include <stdio.h>
#include <memory>
#include <set>
#include <string>

namespace Wishlist {

struct MGDataBinding {
  virtual std::set<int> applyChangesAndGetDirtyIndices(
      std::pair<int, int> windowIndexRange) = 0;
  virtual ~MGDataBinding() {}
};

}; // namespace Wishlist
