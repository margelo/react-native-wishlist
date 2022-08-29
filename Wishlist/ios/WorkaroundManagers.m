#import "WorkaroundManagers.h"
#import "MGWishListComponent.h"
#import "MGTemplateContainerComponent.h"
#import "MGTemplateInterceptorComponent.h"
#import <React/RCTComponentViewFactory.h>

@interface Workaround : NSObject <RCTBridgeModule>

@end

@implementation Workaround

RCT_EXPORT_MODULE(Workaround);

RCT_EXPORT_METHOD(registerList)
{
    [[RCTComponentViewFactory currentComponentViewFactory] registerComponentViewClass: [MGWishListComponent class]];
}

RCT_EXPORT_METHOD(registerContainer)
{
    [[RCTComponentViewFactory currentComponentViewFactory] registerComponentViewClass: [MGTemplateContainerComponent class]];
}

RCT_EXPORT_METHOD(registerInterceptor)
{
    [[RCTComponentViewFactory currentComponentViewFactory] registerComponentViewClass: [MGTemplateInterceptorComponent class]];
}

@end

@implementation MGWishListComponentManager

RCT_EXPORT_MODULE(MGWishListComponentManager)

RCT_CUSTOM_VIEW_PROPERTY(names, NSArray<NSString*>* , UIView){}
RCT_CUSTOM_VIEW_PROPERTY(inflatorId, NSString* , UIView){}

- (UIView *)view
{
  return [[UIView alloc] init];
}

@end

@implementation MGNativeTemplateContainerManager

RCT_EXPORT_MODULE(MGNativeTemplateContainerManager)

RCT_CUSTOM_VIEW_PROPERTY(inflatorId, NSString* , UIView){}

- (UIView *)view
{
  return [[UIView alloc] init];
}

@end

@implementation MGTemplateInterceptorManager

RCT_EXPORT_MODULE(MGTemplateInterceptorManager)

RCT_CUSTOM_VIEW_PROPERTY(inflatorId, NSString* , UIView){}

- (UIView *)view
{
  return [[UIView alloc] init];
}

@end
