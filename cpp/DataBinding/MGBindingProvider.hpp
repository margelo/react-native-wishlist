//
//  MGBindingProvider.hpp
//  MGWishList
//
//  Created by Szymon on 13/01/2023.
//

#pragma once

#include <jsi/jsi.h>
#include <stdio.h>

namespace Wishlist {

using namespace facebook;

struct MGBindingProvider {
  virtual jsi::Value getBinding(jsi::Runtime &rt) = 0;
};

}; // namespace Wishlist
