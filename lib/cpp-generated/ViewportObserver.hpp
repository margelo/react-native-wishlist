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
    float offset;
    int index;
    float height;
    std::shared_ptr<const LayoutableShadowNode> sn;
};

struct ViewportObserver {
    float offset;
    float windowHeight;
    int surfaceId;
    
    ComponentsPool componentsPool;
    ItemProvider itemProvider;
    std::deque<WishItem> window;
    
    void initOrUpdate(int surfaceId, float offset, float windowHeight, float originItemOffset, float originItem) {
        for (WishItem & item : window) {
            componentsPool.returnToPool(item.sn);
        }
        window.clear();
        
        this->surfaceId = surfaceId;
        this->offset = offset;
        this->windowHeight = windowHeight;
        
        window.push_back(itemProvider.provide(originItem));
        window.back().offset = originItemOffset;
        updateWindow();
    }
    
    void reactToOffsetChange(float offset) {
        updateWindow();
    }
    
    void updateWindow() {
        float topEdge = offset - windowHeight;
        float bottomEdge = offset + 2 * windowHeight;
        
        // Add above
        while (1) {
            WishItem & item = window.front();
            float bottom = item.offset + item.height;
            
            if (bottom < bottomEdge) {
                WishItem wishItem = itemProvider.provide(item.index-1);
                if (wishItem.sn.get() == nullptr) {
                    break;
                }
                wishItem.offset = item.offset - wishItem.height;
                window.push_front(wishItem);
            } else {
                break;
            }
        }
        
        // Add below
        while (1) {
            WishItem & item = window.front();
            float bottom = item.offset + item.height;

            if (item.offset > topEdge) {
                WishItem wishItem = itemProvider.provide(item.index+1);
                if (wishItem.sn.get() == nullptr) {
                    break;
                }
                wishItem.offset = bottom;
                window.push_back(wishItem);
            } else {
                break;
            }
        }
        
        // remove above
        while (1) {
            WishItem & item = window.front();
            float bottom = item.offset + item.height;
            if (bottom <= topEdge) {
                window.pop_front();
                componentsPool.returnToPool(item.sn);
                continue;
            } else {
                break;
            }
        }
        
        // remove below
        while (1) {
            WishItem & item = window.front();
            float bottom = item.offset + item.height;
            if (item.offset >= bottomEdge) {
                window.pop_back();
                componentsPool.returnToPool(item.sn);
                continue;
            } else {
                break;
            }
        }
    }
};

#endif /* ViewportObserver_hpp */
