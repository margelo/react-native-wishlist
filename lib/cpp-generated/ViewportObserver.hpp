//
//  ViewportObserver.hpp
//  MGWishList
//
//  Created by Szymon on 27/11/2021.
//

#ifndef ViewportObserver_hpp
#define ViewportObserver_hpp

#include <stdio.h>
#include "ItemProvider.hpp"
#include <deque>
// Temporary solution only for PoC
#include <react/renderer/uimanager/UIManager.h>

// TODO make use of pointFactor
struct ViewportObserver {
    float offset;
    float windowHeight;
    float windowWidth;
    int surfaceId;
    static thread_local bool isPushingChildren;
    
    std::shared_ptr<ComponentsPool> componentsPool = std::make_shared<ComponentsPool>();
    std::shared_ptr<ItemProvider> itemProvider;
    std::deque<WishItem> window;
    std::weak_ptr<ShadowNode> weakWishListNode;
    
    void boot(int surfaceId, float offset, float windowHeight, float windowWidth, float originItemOffset, int originItem, std::weak_ptr<ShadowNode> weakWishListNode) {
        
        this->weakWishListNode = weakWishListNode;
        itemProvider = std::static_pointer_cast<ItemProvider>(std::make_shared<ItemProviderTestImpl>());
        itemProvider->setComponentsPool(componentsPool);
        
        for (WishItem & item : window) {
            componentsPool->returnToPool(item.sn);
        }
        window.clear();
        
        this->surfaceId = surfaceId;
        this->offset = offset;
        this->windowHeight = windowHeight;
        
        window.push_back(itemProvider->provide(originItem));
        window.back().offset = originItemOffset;
        updateWindow(true);
    }
    
    // TODO: fix
    void update(int surfaceId, float offset, float windowHeight, float originItemOffset, int originItem, std::weak_ptr<ShadowNode> weakWishListNode) {
        
        this->weakWishListNode = weakWishListNode;
        itemProvider = std::static_pointer_cast<ItemProvider>(std::make_shared<ItemProviderTestImpl>());
        itemProvider->setComponentsPool(componentsPool);
        
        for (WishItem & item : window) {
            componentsPool->returnToPool(item.sn);
        }
        window.clear();
        
        this->surfaceId = surfaceId;
        this->offset = offset;
        this->windowHeight = windowHeight;
        
        window.push_back(itemProvider->provide(originItem));
        window.back().offset = originItemOffset;
        updateWindow(true);
    }
    
    void reactToOffsetChange(float offset) {
        updateWindow(false);
    }
    
    void updateWindow(bool updateDirectly) {
        float topEdge = offset - windowHeight;
        float bottomEdge = offset + 2 * windowHeight;
        
        // Add above
        while (1) {
            WishItem & item = window.front();
            float bottom = item.offset + item.height;
            
            if (bottom < bottomEdge) {
                WishItem wishItem = itemProvider->provide(item.index-1);
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
                WishItem wishItem = itemProvider->provide(item.index+1);
                if (wishItem.sn.get() == nullptr) {
                    break;
                }
                wishItem.offset = bottom;
                window.push_back(wishItem);
            } else {
                break;
            }
        }
        
        std::vector<WishItem> itemsToRemove;
        
        // remove above
        while (1) {
            WishItem & item = window.front();
            float bottom = item.offset + item.height;
            if (bottom <= topEdge) {
                window.pop_front();
                itemsToRemove.push_back(std::move(item));
                continue;
            } else {
                break;
            }
        }
        
        // remove below
        while (1) {
            WishItem & item = window.front();
            if (item.offset >= bottomEdge) {
                window.pop_back();
                itemsToRemove.push_back(std::move(item));
                continue;
            } else {
                break;
            }
        }
        
        pushChildren(updateDirectly);
        
        for (auto & item : itemsToRemove) {
            componentsPool->returnToPool(item.sn);
        }
    }
    
    std::shared_ptr<ShadowNode> getOffseter(float offset);
    
    void pushChildren(bool pushDirectly);
};

#endif /* ViewportObserver_hpp */
