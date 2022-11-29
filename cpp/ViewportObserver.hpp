#ifndef ViewportObserver_hpp
#define ViewportObserver_hpp

#include <stdio.h>
#include "ItemProvider.hpp"
#include <deque>
#include <iostream>
#include <set>
// Temporary solution only for PoC
#include <react/renderer/uimanager/UIManager.h>

// TODO make use of pointFactor
struct ViewportObserver {
    float offset;
    float windowHeight;
    float windowWidth;
    int surfaceId;
    int initialIndex;
    int optimisticallyInflateTop = 0;
    static thread_local bool isPushingChildren;
    
    std::shared_ptr<ComponentsPool> componentsPool = std::make_shared<ComponentsPool>();
    std::shared_ptr<ItemProvider> itemProvider;
    std::deque<WishItem> window;
    std::shared_ptr<ShadowNode> wishListNode;
    LayoutContext lc;
    ShadowNode::SharedListOfShared wishlistChildren = std::make_shared<ShadowNode::ListOfShared>();
    
    void setInitialValues(std::shared_ptr<ShadowNode> wishListNode, LayoutContext lc) {
        this->wishListNode = wishListNode;
        this->lc = lc;
    }
    
    void boot(float offset, float windowHeight, float windowWidth, float originItemOffset, int originItem,
        std::vector<std::shared_ptr<ShadowNode const>> registeredViews,
        std::vector<std::string> names,
        std::string inflatorId) {
        
        std::cout << "aaa boot" << std::endl;
        
        initialIndex = originItem;
        
        componentsPool->registeredViews = registeredViews;
        componentsPool->setNames(names);
        
        itemProvider = std::static_pointer_cast<ItemProvider>(std::make_shared<WorkletItemProvider>(windowWidth, lc, inflatorId));
        itemProvider->setComponentsPool(componentsPool);
        
        for (WishItem & item : window) {
            componentsPool->returnToPool(item.sn);
        }
        window.clear();
        
        this->surfaceId = wishListNode->getFamily().getSurfaceId();
        this->offset = offset;
        this->windowHeight = windowHeight;
        
        window.push_back(itemProvider->provide(originItem));
        std::cout << "BBB initial index  " << originItem << std::endl;
        window.back().offset = originItemOffset;
        updateWindow(true);
    }
    
    jsi::Value getBinding();
    
    bool updateDirtyItems() {
        float offset = window.front().offset;
        bool changedAnything = false;
        
        for (auto & item : window) {
            item.offset = offset;
            if (item.dirty) {
                changedAnything = true;
                item.dirty = false;
                WishItem wishItem = itemProvider->provide(item.index);
                wishItem.offset = offset;
                std::swap(item, wishItem);
                componentsPool->returnToPool(wishItem.sn);
            }
            offset = item.offset + item.height;
        }
        return changedAnything;
    }
    
    void update(float windowHeight, float windowWidth,
                std::vector<std::shared_ptr<ShadowNode const>> registeredViews,
                std::vector<std::string> names,
                std::string inflatorId) {
        
            itemProvider = std::static_pointer_cast<ItemProvider>(std::make_shared<WorkletItemProvider>(windowWidth, lc, inflatorId));
            itemProvider->setComponentsPool(componentsPool);
        
    
        float oldOffset = window[0].offset; // TODO (maybe update if frame has changed)
        // TODO (sometimes we have to modify the index by the number of new elements above)
        float oldIndex = window[0].index;
        
        std::vector<WishItem> itemsToRemove;
        for (auto & ele : window) {
            itemsToRemove.push_back(ele);
        }
        
        window.clear();
        
        for (auto & item : itemsToRemove) {
            componentsPool->returnToPool(item.sn);
        }
        
            componentsPool->registeredViews = registeredViews;
            componentsPool->setNames(names);
            componentsPool->templatesUpdated();
        
        window.push_back(itemProvider->provide(oldIndex));
        window.back().offset = oldOffset;
        updateWindow(true);
    }
    
    bool reactToOffsetChange(float offset) {
        this->offset = offset;
        return updateWindow(false);
    }
    
    bool updateWindow(bool newTemplates) {
        float topEdge = offset - (windowHeight * 0.1);
        float bottomEdge = offset + (1.1 * windowHeight);
        bool changedAnything = false;
        optimisticallyInflateTop = 1 - optimisticallyInflateTop;
        
        assert(window.size() != 0);
        
        // Add above
        while (1) {
            WishItem item = window.front();
            float bottom = item.offset + item.height;
            
            if (item.offset > topEdge) {
                WishItem wishItem = itemProvider->provide(item.index - 1);
                if (wishItem.sn.get() == nullptr) {
                    break;
                }
                wishItem.offset = item.offset - wishItem.height;
                window.push_front(wishItem);
                changedAnything = true;
            } else {
                break;
            }
        }
        
        // Add below
        while (1) {
            WishItem item = window.back();
            float bottom = item.offset + item.height;

            if (bottom < bottomEdge) {
                WishItem wishItem = itemProvider->provide(item.index + 1);
                if (wishItem.sn.get() == nullptr) {
                    break;
                }
                wishItem.offset = bottom;
                window.push_back(wishItem);
                changedAnything = true;
            } else {
                break;
            }
        }
        
        std::vector<WishItem> itemsToRemove;
        
        // remove above
        while (1) {
            WishItem item = window.front();
            float bottom = item.offset + item.height;
            if (bottom <= topEdge) {
                window.pop_front();
                itemsToRemove.push_back(item);
                changedAnything = true;
                continue;
            } else {
                break;
            }
        }
        
        // remove below
        while (1) {
            WishItem item = window.back();
            if (item.offset >= bottomEdge) {
                window.pop_back();
                itemsToRemove.push_back(item);
                changedAnything = true;
                continue;
            } else {
                break;
            }
        }
        
        for (auto & item : window) {
            float bottom = item.offset + item.height;
            if (item.offset <= bottomEdge and bottom >= topEdge and item.next) {
                item.next = false;
                changedAnything = true;
            }
        }
        
        if (!changedAnything) { // optimisically inflate items
            topEdge -= windowHeight;
            bottomEdge += windowHeight;
            if (optimisticallyInflateTop) { // inflate above
                WishItem item = window.front();
                float bottom = item.offset + item.height;
                
                if (item.offset > topEdge) {
                    WishItem wishItem = itemProvider->provide(item.index - 1);
                    if (wishItem.sn.get() != nullptr) {
                        wishItem.offset = item.offset - wishItem.height;
                        window.push_front(wishItem);
                    }
                }
            } else { // inflate below
                WishItem item = window.back();
                float bottom = item.offset + item.height;

                if (bottom < bottomEdge) {
                    WishItem wishItem = itemProvider->provide(item.index + 1);
                    if (wishItem.sn.get() != nullptr) {
                        wishItem.offset = bottom;
                        window.push_back(wishItem);
                    }
                }
            }
            
           // TODO inflate optimistically
            return false;
        }
        
        pushChildren();
        
        for (auto & item : itemsToRemove) {
            componentsPool->returnToPool(item.sn);
        }
        return true;
    }
    
    std::shared_ptr<ShadowNode> getOffseter(float offset, const ShadowNode & sn);
    
    void pushChildren();
};

#endif /* ViewportObserver_hpp */
