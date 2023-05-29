#import "MGContentContainerComponent.h"

#import <react/renderer/components/wishlist/ComponentDescriptors.h>
#import <react/renderer/components/wishlist/Props.h>
#import "MGContentContainerComponentDescriptor.h"
#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

@implementation MGContentContainerComponent

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const MGContentContainerProps>();
    _props = defaultProps;
  }

  return self;
}

#pragma mark - RCTComponentViewProtocol

+ (facebook::react::ComponentDescriptorProvider)componentDescriptorProvider
{
  return facebook::react::concreteComponentDescriptorProvider<facebook::react::MGContentContainerComponentDescriptor>();
}

@end

Class<RCTComponentViewProtocol> MGContentContainerCls(void)
{
  return MGContentContainerComponent.class;
}
