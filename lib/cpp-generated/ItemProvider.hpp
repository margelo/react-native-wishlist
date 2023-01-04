//
//  ItemProvider.hpp
//  MGWishList
//
//  Created by Szymon on 30/11/2021.
//

#ifndef ItemProvider_hpp
#define ItemProvider_hpp

#include <stdio.h>
#include <memory>
#include "ComponentsPool.h"

using namespace facebook::react;

struct WishItem
{
    float offset;
    int index;
    float height;
    std::shared_ptr<const LayoutableShadowNode> sn;
};

class ItemProvider {
public:
    void setComponentsPool(std::shared_ptr<ComponentsPool> pool) = 0;
    
    WishItem provide(int index) = 0;
};

struct ItemProviderTestImpl : ItemProvider
{
    std::shared_ptr<ComponentProvider> cp;
    
    void setComponentsPool(ComponentsPool & pool) = 0;
    
    WishItem provide(int index) = 0;
};

#endif /* ItemProvider_hpp */
