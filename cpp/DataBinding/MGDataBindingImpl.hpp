//
//  MGDataBindingImpl.hpp
//  MGWishList
//
//  Created by Szymon on 16/01/2023.
//

#ifndef MGDataBindingImpl_hpp
#define MGDataBindingImpl_hpp

#include <stdio.h>
#include <memory>
#include "MGDataBinding.hpp"
#include "MGDI.hpp"
#include <set>

struct MGDataBindingImpl : MGDataBinding {
    std::weak_ptr<MGDI> di;
    std::string _wishlistId;
    
    MGDataBindingImpl(std::string wishlistId, std::weak_ptr<MGDI> _di);
    
    virtual std::set<int> applyChangesAndGetDirtyIndices(std::pair<int, int> windowIndexRange);
    
    void registerBindings();
    void unregisterBindings();

    virtual ~MGDataBindingImpl();
};

#endif /* MGDataBindingImpl_hpp */
