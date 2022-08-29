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
        // TODO get templates
        MGTemplateContainerComponent * container = (MGTemplateContainerComponent *)childComponentView;
        // container.templates TODO
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
    [super unmountChildComponentView:childComponentView index:index];
}



@end
