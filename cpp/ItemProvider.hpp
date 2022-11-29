#ifndef ItemProvider_hpp
#define ItemProvider_hpp

#include <stdio.h>
#include <memory>
#include "ComponentsPool.h"
#include <react/renderer/uimanager/primitives.h>
#include "ReanimatedRuntimeHandler.hpp"

using namespace facebook::react;

struct WishItem
{
    float offset;
    int index;
    std::string key;
    float height;
    bool dirty = false;
    bool next = true;
    std::shared_ptr<ShadowNode> sn;
};

class ItemProvider {
public:
    float maxWidth = 0;
    LayoutConstraints lcc;
    LayoutContext lc;
    
    ItemProvider(float maxWidth, LayoutContext lc) {
        this->maxWidth = maxWidth;
        this->lc = lc;
        lcc.layoutDirection = facebook::react::LayoutDirection::LeftToRight;
        lcc.maximumSize.width = maxWidth;
    }
    
    virtual void setComponentsPool(std::shared_ptr<ComponentsPool> pool) = 0;
    
    virtual WishItem provide(int index) = 0;
    
    virtual ~ItemProvider() {}
};

//TODO create provider based on worklet and inflateItem method

struct ItemProviderTestImpl : ItemProvider
{
    std::shared_ptr<ComponentsPool> cp;
    
    ItemProviderTestImpl(float maxWidth, LayoutContext lc, std::string tag): ItemProvider(maxWidth, lc) {}
    
    void setComponentsPool(std::shared_ptr<ComponentsPool> pool) {
        cp = pool;
    }
    
    WishItem provide(int index) {
        WishItem wishItem;
        if (index < 0 or index > 1000) {
            return wishItem;
        }
        std::shared_ptr<const ShadowNode> sn;
        if (index & 1) {
            std::shared_ptr<const ShadowNode> item = cp->getNodeForType("type1");
            sn = item;
            // TODO change some things
        } else {
            std::shared_ptr<const ShadowNode> item = cp->getNodeForType("type2");
            sn = item;
            // TODO change some things
        }
        
        auto affected = std::vector<const LayoutableShadowNode *>();
        this->lc.affectedNodes = &affected;
        // better use layoutTree instead of measure (will be persistant)
        std::shared_ptr<YogaLayoutableShadowNode> ysn = std::static_pointer_cast<YogaLayoutableShadowNode>(sn->clone({}));
        facebook::react::Size sz = ysn->measure(this->lc, this->lcc);
        
        wishItem.sn = std::static_pointer_cast<ShadowNode>(ysn);
        wishItem.height = sz.height;
        wishItem.index = index;
        return wishItem;
    }
};

struct WorkletItemProvider : ItemProvider
{
    std::shared_ptr<ComponentsPool> cp;
    std::string tag;
    
    WorkletItemProvider(float maxWidth, LayoutContext lc, std::string tag): ItemProvider(maxWidth, lc) {
        this->tag = tag;
    }
    
    void setComponentsPool(std::shared_ptr<ComponentsPool> pool) {
        cp = pool;
    }
    
    WishItem provide(int index);
};

#endif /* ItemProvider_hpp */
