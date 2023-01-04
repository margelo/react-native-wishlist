//
//  ViewportObserver.cpp
//  MGWishList
//
//  Created by Szymon on 27/11/2021.
//

#include "ViewportObserver.hpp"
#import "RCTFollyConvert.h"

using namespace facebook::react;

std::shared_ptr<ShadowNode> ViewportObserver::getOffseter(float offset) {
    std::shared_ptr<const LayoutableShadowNode> offseterTemplate = std::static_pointer_cast<const LayoutableShadowNode>(componentsPool->getNodeForType("__offsetComponent"));
    
    auto & cd = offseterTemplate->getComponentDescriptor();
    PropsParserContext propsParserContext{surfaceId, *cd.getContextContainer().get()};
    
    folly::dynamic props = convertIdToFollyDynamic(@{
        @"height": @(offset)
    });
    
    Props::Shared newProps = cd.cloneProps(
        propsParserContext,
        offseterTemplate->getProps(),
        RawProps(props)
    );
    
    return offseterTemplate->clone({newProps, nullptr, nullptr});
}
