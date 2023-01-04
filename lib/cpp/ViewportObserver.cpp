#include "ViewportObserver.hpp"
#include "WishlistShadowNodes.h"
#include <folly/dynamic.h>

using namespace facebook::react;

thread_local bool ViewportObserver::isPushingChildren = false;

std::shared_ptr<ShadowNode> ViewportObserver::getOffseter(float offset) {
    std::shared_ptr<const YogaLayoutableShadowNode> offseterTemplate = std::static_pointer_cast<const YogaLayoutableShadowNode
    >(componentsPool->getNodeForType("__offsetComponent"));
    
    auto & cd = offseterTemplate->getComponentDescriptor();
    PropsParserContext propsParserContext{surfaceId, *cd.getContextContainer().get()};
    
    // TODO(Szymon) remove bg color
    folly::dynamic props = folly::dynamic::object("height", offset)
    ("width", this->windowWidth)
    ("backgroundColor", (*(colorFromComponents(ColorComponents{0, 0, 1, 1}))));
    
    Props::Shared newProps = cd.cloneProps(
        propsParserContext,
        offseterTemplate->getProps(),
        RawProps(props)
    );
    
    return offseterTemplate->clone({newProps, nullptr, nullptr});
}

void  ViewportObserver::pushChildren(bool pushDirectly) {
    isPushingChildren = true;
    
    std::shared_ptr<ShadowNode> sWishList = weakWishListNode.lock();
    if (sWishList.get() == nullptr) {
        return;
    }
    
    if (pushDirectly) {
        std::shared_ptr<WishlistShadowNode> WishlistNode = std::static_pointer_cast<WishlistShadowNode>(sWishList);
        WishlistNode->realAppendChild(getOffseter(window[0].offset));
        
        for (WishItem & wishItem : window) {
            WishlistNode->realAppendChild(wishItem.sn);
        }
    } else {
        KeyClassHolder::shadowTreeRegistry->visit(surfaceId, [&](const ShadowTree & st) {
            ShadowTreeCommitTransaction transaction = [&](RootShadowNode const &oldRootShadowNode) -> std::shared_ptr<RootShadowNode> {
                return std::static_pointer_cast<RootShadowNode>(oldRootShadowNode.cloneTree(sWishList->getFamily(), [&](const ShadowNode & sn) -> std::shared_ptr<ShadowNode> {
                    auto children = std::make_shared<ShadowNode::ListOfShared>();
                    
                    children->push_back(getOffseter(window[0].offset));
                    
                    for (WishItem & wishItem : window) {
                      children->push_back(wishItem.sn);
                    }
                    
                    return sn.clone(ShadowNodeFragment{nullptr, children, nullptr});
                }));
            };
            st.commit(transaction);
        });
    }
    isPushingChildren = false;
}
