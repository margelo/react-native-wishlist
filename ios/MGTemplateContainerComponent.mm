#import "MGTemplateContainerComponent.h"
#import "MGContainerComponentDescriptors.h"
#import "MGContainerProps.h"

using namespace facebook::react;

@implementation MGTemplateContainerComponent {
  MGWishListComponent *_wishList;
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const MGTemplateContainerComponentProps>();
    _props = defaultProps;
  }

  return self;
}

- (void)setWishlist:(MGWishListComponent *)wishList
{
  _wishList = wishList;
  auto props = *std::static_pointer_cast<const MGTemplateContainerComponentProps>(_props);
  [_wishList setWishlistId:props.wishlistId];
  [_wishList setInflatorId:props.inflatorId];
  [_wishList setTemplates:props.templates withNames:props.names];
}

#pragma mark - RCTComponentViewProtocol

+ (facebook::react::ComponentDescriptorProvider)componentDescriptorProvider
{
  return facebook::react::concreteComponentDescriptorProvider<
      facebook::react::MGTemplateContainerComponentComponentDescriptor>();
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<const MGTemplateContainerComponentProps>(props);
  if (_wishList != NULL) {
    [_wishList setWishlistId:newProps.wishlistId];
    [_wishList setInflatorId:newProps.inflatorId];
    [_wishList setTemplates:newProps.templates withNames:newProps.names];
  }

  [super updateProps:props oldProps:oldProps];
}

@end
