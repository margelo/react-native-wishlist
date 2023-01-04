//
//  MGTemplateContainerComponent.h
//  MGWishList
//
//  Created by Szymon on 29/08/2022.
//

#import <React-RCTFabric/React/RCTViewComponentView.h>
#import "MGWishListComponent.h"

NS_ASSUME_NONNULL_BEGIN

@interface MGTemplateContainerComponent : RCTViewComponentView

-(void)setWishlist:(MGWishListComponent *)wishList;

@end

NS_ASSUME_NONNULL_END
