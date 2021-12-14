//
//  ItemProvider.cpp
//  MGWishList
//
//  Created by Szymon on 30/11/2021.
//

#include "ItemProvider.hpp"
#include <react/renderer/uimanager/UIManager.h>
#include <react/renderer/uimanager/primitives.h>

//TODO we need to use our own runtime because we can call things from several threads
// just not enought time to do it right now

std::shared_ptr<jsi::Runtime> WorkletItemProvider::rtPtr = nullptr;

struct 

WishItem WorkletItemProvider::provide(int index) {
    WishItem wishItem;
    
    jsi::Runtime &rt = *rtPtr;
    
    jsi::Function inflateItem = rt.global().getPropertyAsObject(rt, "InflatorRegistry").getPropertyAsFunction(rt, "inflateItem");
    
    jsi::Value returnedValue = inflateItem.call(
        rt,
        jsi::Value::undefined(),
        jsi::Value(tag),
        jsi::Value(index),
        cp->prepareProxy(rt)
    );
    
    if (returnedValue.isUndefined()) {
        return wishItem;
    }
    
    std::shared_ptr<ShadowNodeWrapper> shadowNodeWrapper = returnedValue.asObject(rt).getHostObject<ShadowNodeWrapper>(rt);
    
    std::shared_ptr<const ShadowNode> sn = shadowNodeWrapper->shadowNode;
    
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

