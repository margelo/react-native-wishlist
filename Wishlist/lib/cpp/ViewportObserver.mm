//
//  ViewportObserver.cpp
//  MGWishList
//
//  Created by Szymon on 27/11/2021.
//

#include "ViewportObserver.hpp"
#include "WishlistShadowNodes.h"
#import "RCTFollyConvert.h"

using namespace facebook::react;

thread_local bool ViewportObserver::isPushingChildren = false;

std::shared_ptr<ShadowNode> ViewportObserver::getOffseter(float offset) {
    std::shared_ptr<const YogaLayoutableShadowNode> offseterTemplate = std::static_pointer_cast<const YogaLayoutableShadowNode
    >(componentsPool->getNodeForType("__offsetComponent"));
    
    auto & cd = offseterTemplate->getComponentDescriptor();
    PropsParserContext propsParserContext{surfaceId, *cd.getContextContainer().get()};
    
    // todo remove color
    folly::dynamic props = convertIdToFollyDynamic(@{
        @"height": @(offset),
        @"width": @(this->windowWidth),
        @"backgroundColor": @((*(colorFromComponents(ColorComponents{0, 0, 1, 1}))))
    });
    
    Props::Shared newProps = cd.cloneProps(
        propsParserContext,
        offseterTemplate->getProps(),
        RawProps(props)
    );
    
    return offseterTemplate->clone({newProps, nullptr, nullptr});
}

void  ViewportObserver::pushChildren() {
    isPushingChildren = true;
    
    std::shared_ptr<ShadowNode> sWishList = wishListNode;
    if (sWishList.get() == nullptr) {
        return;
    }
    
    
    KeyClassHolder::shadowTreeRegistry->visit(surfaceId, [&](const ShadowTree & st) {
        ShadowTreeCommitTransaction transaction = [&](RootShadowNode const &oldRootShadowNode) -> std::shared_ptr<RootShadowNode> {
            return std::static_pointer_cast<RootShadowNode>(oldRootShadowNode.cloneTree(sWishList->getFamily(), [&](const ShadowNode & sn) -> std::shared_ptr<ShadowNode> {
                auto children = std::make_shared<ShadowNode::ListOfShared>();
                
                children->push_back(getOffseter(window[0].offset));
                
                for (WishItem & wishItem : window) {
                  if(wishItem.sn != nullptr) {
                    children->push_back(wishItem.sn);
                  }
                }
                
                return sn.clone(ShadowNodeFragment{nullptr, children, nullptr});
            }));
        };
        st.commit(transaction);
    });
    
    isPushingChildren = false;
}
