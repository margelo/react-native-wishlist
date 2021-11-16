//
//  MGWishListComponent.m
//  MGWishList
//
//  Created by Szymon on 11/11/2021.
//

#import "MGWishListComponent.h"
#import <React/RCTConversions.h>
#import <React/RCTImageResponseDelegate.h>
#import <React/RCTImageResponseObserverProxy.h>

#import <react/renderer/components/rncore/EventEmitters.h>
#import <react/renderer/components/rncore/Props.h>
#import "RCTFabricComponentsPlugins.h"
#import "ModuleComponentDescriptors.h"
#import "ModuleProps.h"
#import "ModuleShadowNodes.h"
#import <React/RCTBridgeModule.h>
#import <React/RCTComponentViewFactory.h>

using namespace facebook::react;


@implementation MGWishListComponent

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
  }
  return self;
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<ModuleComponentDescriptor>();
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    NSLog(@"wegwgw");
  const auto &oldSliderProps = *std::static_pointer_cast<const ModuleProps>(_props);
  const auto &newSliderProps = *std::static_pointer_cast<const ModuleProps>(props);
    int z = 3;
}


Class<RCTComponentViewProtocol> MGWishListCls(void)
{
  return [MGWishListComponent class];
}

@end

@interface Workaround : NSObject <RCTBridgeModule>

@end

@implementation Workaround

RCT_EXPORT_MODULE(Workaround);

RCT_EXPORT_METHOD(registerList)
{
    [[RCTComponentViewFactory currentComponentViewFactory] registerComponentViewClass: [MGWishListComponent class]];
}

@end
