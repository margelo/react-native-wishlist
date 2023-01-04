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
    virtual void setComponentsPool(std::shared_ptr<ComponentsPool> pool) = 0;
    
    virtual WishItem provide(int index) = 0;
    
    virtual ~ItemProvider() {}
};

//TODO create provider based on worklet and inflateItem method

struct ItemProviderTestImpl : ItemProvider
{
    std::shared_ptr<ComponentsPool> cp;
    
    void setComponentsPool(std::shared_ptr<ComponentsPool> pool) {
        cp = pool;
    }
    
    WishItem provide(int index) {
        WishItem wishItem;
        if (index < 0 or index > 1000) {
            return wishItem;
        }
        std::shared_ptr<LayoutableShadowNode> sn;
        if (index & 1) {
            std::shared_ptr<const ShadowNode> item = cp->getNodeForType("type1");
            sn = std::static_pointer_cast<LayoutableShadowNode>(item);
            // TODO change some things
        } else {
            std::shared_ptr<const ShadowNode> item = cp->getNodeForType("type2");
            sn = std::static_pointer_cast<LayoutableShadowNode>(item);
            // TODO change some things
        }
        
        LayoutContext lc;
        LayoutConstraints lcc;
        facebook::react::Size sz = sn->measure(lc, lcc);
        
        wishItem.sn = sn;
        wishItem.height = sz.height;
        wishItem.index = index;
        return wishItem;
    }
};

#endif /* ItemProvider_hpp */
