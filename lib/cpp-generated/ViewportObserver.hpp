//
//  ViewportObserver.hpp
//  MGWishList
//
//  Created by Szymon on 27/11/2021.
//

#ifndef ViewportObserver_hpp
#define ViewportObserver_hpp

#include <stdio.h>
#include "ComponentsPool.h"

struct WishItem
{
    int index;
    float height;
    std::shared_ptr<const LayoutableShadowNode> sn;
};

struct ViewportObserver {
    float offset;
    float windowHeight;
    float originItemOffset;
    int originItem;
    int indexOfOriginItem;
    int sufraceId;
    
    ComponentsPool componentsPool;
    ItemsProvider itemsProvider;
    std::vector<WishItem> window;
    
    void initOrUpdate(int surfaceId, float offset, float windowHeight, float originItemOffset, float originItem) {
        for (WishItem & item : window) {
            componentsPool.returnToPool(item.sn);
        }
        window.clear();
        
        this->surfaceId;
        this->offset = offset;
        this->windowHeight = windowHeight;
        this->originItemOffset = originItemOffset;
        this->originItem = originItem;
        
        window.push_back(itemsProvider.provide(originItem));
        updateWindow();
    }
    
    void reactToOffsetChange(float offset) {
        updateWindow();
    }
    
    void updateWindow() {
        
    }
    
}

#endif /* ViewportObserver_hpp */
