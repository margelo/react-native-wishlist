//
//  MGDataBinding.hpp
//  MGWishList
//
//  Created by Szymon on 13/01/2023.
//

#ifndef MGDataBinding_hpp
#define MGDataBinding_hpp

#include <stdio.h>
#include <set>
#include <string>
#include <memory>

struct MGDataBinding {
    virtual std::set<int> applyChangesAndGetDirtyIndices(std::pair<int, int> windowIndexRange) = 0;
    virtual ~MGDataBinding() {}
};

#endif /* MGDataBinding_hpp */
