//
//  MGTemplateInterceptorComponent.m
//  MGWishList
//
//  Created by Szymon on 29/08/2022.
//

#import "MGTemplateInterceptorComponent.h"
#import "MGInterceptorComponentDescriptors.h"
#import "MGTemplateContainerComponent.h"
#import "MGWishListComponent.h"
#import "MGInterceptorProps.h"

using namespace facebook::react;

@implementation MGTemplateInterceptorComponent {
    MGWishListComponent * _wishlist;
}

/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect {
    // Drawing code
}
*/

#pragma mark - RCTComponentViewProtocol

+ (facebook::react::ComponentDescriptorProvider)componentDescriptorProvider
{
    return facebook::react::concreteComponentDescriptorProvider<facebook::react::MGTemplateInterceptorComponentComponentDescriptor>(); 
}

/*
 * Called for mounting (attaching) a child component view inside `self`
 * component view.
 * Receiver must add `childComponentView` as a subview.
 */
- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index{
    if ([childComponentView isKindOfClass:[MGTemplateContainerComponent class]]) {
        MGTemplateContainerComponent * container = (MGTemplateContainerComponent *)childComponentView;
        auto templates = [container getTemplates];
        auto names = [container getNames];
        if (_wishlist != nil) {
            [_wishlist setTemplates:templates withNames:names];
        }
        return;
    }
    if ([childComponentView isKindOfClass:[MGWishListComponent class]]) {
        _wishlist = (MGWishListComponent*)childComponentView;
    }
    [super mountChildComponentView:childComponentView index:index];
}

/*
 * Called for unmounting (detaching) a child component view from `self`
 * component view.
 * Receiver must remove `childComponentView` as a subview.
 */
- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index {
    if ([childComponentView isKindOfClass:[MGWishListComponent class]]) {
        _wishlist = nil;
    }
    if ([childComponentView isKindOfClass:[MGTemplateContainerComponent class]]) {
        return;
    }
    [super unmountChildComponentView:childComponentView index:index];
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    //inflatorId = std::dynamic_pointer_cast<const WishlistProps>(props)->inflatorId;
    //[super updateProps:props oldProps:oldProps];
   // _eventEmitter = nil;
}



@end
