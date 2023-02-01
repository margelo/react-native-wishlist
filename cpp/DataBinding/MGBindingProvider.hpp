//
//  MGBindingProvider.hpp
//  MGWishList
//
//  Created by Szymon on 13/01/2023.
//

#ifndef MGBindingProvider_hpp
#define MGBindingProvider_hpp

#include <stdio.h>
#include <jsi/jsi.h>

using namespace facebook;

struct MGBindingProvider {
    virtual jsi::Value getBinding(jsi::Runtime & rt) = 0;
};

#endif /* MGBindingProvider_hpp */
