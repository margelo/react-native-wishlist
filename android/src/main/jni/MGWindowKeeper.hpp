//
//  MGWindowKeeper.hpp
//  MGWishList
//
//  Created by Szymon on 13/01/2023.
//

#ifndef MGWindowKeeper_hpp
#define MGWindowKeeper_hpp

#include <stdio.h>
#include <vector>
#include "MGAnimationSight.hpp"
#include "MGPushChildrenListener.hpp"
#include "MGDI.hpp"

struct MGWindowKeeper : MGAnimationSight, MGPushChildrenListener {
    std::vector<Item> items;
    std::weak_ptr<MGDI> di;

    MGWindowKeeper(std::weak_ptr<MGDI> _di);

#pragma mark MGAnimationSight

    virtual float getOffsetIfItemIsAlreadyRendered(int index);
    virtual bool isTargetItemLocatedBelow(int targetItem);

#pragma mark MGPushChildrenListener

    virtual void didPushChildren(std::vector<Item> newWindow);
};

#endif /* MGWindowKeeper_hpp */
