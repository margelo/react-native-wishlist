#import "MGTemplateInterceptorComponent.h"
#import <react/renderer/components/wishlist/ComponentDescriptors.h>
#import <react/renderer/components/wishlist/Props.h>
#import "MGTemplateContainerComponent.h"
#import "MGWishListComponent.h"
#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

@implementation MGTemplateInterceptorComponent {
  MGWishListComponent *_wishlist;
}

#pragma mark - RCTComponentViewProtocol

+ (facebook::react::ComponentDescriptorProvider)componentDescriptorProvider
{
  return facebook::react::concreteComponentDescriptorProvider<
      facebook::react::MGTemplateInterceptorComponentDescriptor>();
}

/*
 * Called for mounting (attaching) a child component view inside `self`
 * component view.
 * Receiver must add `childComponentView` as a subview.
 */
- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
  if ([childComponentView isKindOfClass:[MGTemplateContainerComponent class]]) {
    MGTemplateContainerComponent *container = (MGTemplateContainerComponent *)childComponentView;
    if (_wishlist != nil) {
      [container setWishlist:_wishlist];
    }
    return;
  }
  if ([childComponentView isKindOfClass:[MGWishListComponent class]]) {
    _wishlist = (MGWishListComponent *)childComponentView;
  }
  [super mountChildComponentView:childComponentView index:index];
}

/*
 * Called for unmounting (detaching) a child component view from `self`
 * component view.
 * Receiver must remove `childComponentView` as a subview.
 */
- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
  if ([childComponentView isKindOfClass:[MGWishListComponent class]]) {
    _wishlist = nil;
  }
  if ([childComponentView isKindOfClass:[MGTemplateContainerComponent class]]) {
    return;
  }
  [super unmountChildComponentView:childComponentView index:index];
}

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wobjc-missing-super-calls"
- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  auto wProps = std::static_pointer_cast<const MGTemplateInterceptorProps>(props);

  if (_wishlist) {
    [_wishlist setInflatorId:wProps->inflatorId];
  }

  _props = wProps;
}
#pragma clang diagnostic pop

@end

Class<RCTComponentViewProtocol> MGTemplateInterceptorCls(void)
{
  return MGTemplateInterceptorComponent.class;
}
