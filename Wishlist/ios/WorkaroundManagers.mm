#import "WorkaroundManagers.h"
#import "MGWishListComponent.h"
#import "MGTemplateContainerComponent.h"
#import "MGTemplateInterceptorComponent.h"
#import <React/RCTComponentViewFactory.h>
#import <React/RCTBridge.h>
#import <React/RCTBridge+Private.h>
#import <React/RCTSurfacePresenterStub.h>
#import <React/RCTInitializing.h>
#import <React/RCTSurfacePresenter.h>
#import <React/RCTScheduler.h>
#include <react/renderer/components/view/ViewEventEmitter.h>
#include <react/renderer/core/EventListener.h>
#include "ReanimatedRuntimeHandler.hpp"
#include <jsi/JSIDynamic.h>
#include <jsi/jsi.h>

using EventListener=facebook::react::EventListener;
using RawEvent=facebook::react::RawEvent;

@interface Workaround : NSObject <RCTBridgeModule, RCTInvalidating, RCTInitializing>

@property (nonatomic, weak) RCTBridge *bridge;

@end

@implementation Workaround {
    __weak RCTSurfacePresenter * _surfacePresenter;
    std::shared_ptr<EventListener> _eventListener;
}

RCT_EXPORT_MODULE(Workaround);

RCT_EXPORT_METHOD(registerList)
{
    [[RCTComponentViewFactory currentComponentViewFactory] registerComponentViewClass: [MGWishListComponent class]];
}

- (void)setBridge:(RCTBridge *)bridge {
    _bridge = bridge;
    _surfacePresenter = _bridge.surfacePresenter;
    _eventListener = std::make_shared<EventListener>([](const RawEvent & event) -> bool {
        if (!RCTIsMainQueue() or event.eventTarget == nullptr) {
            // TODO Scheduler reset
          return false;
        }
        std::string type = event.type;
        int tag = event.eventTarget->getTag();
        if (tag >= 0) return false;
        
        std::shared_ptr<jsi::Runtime> rt = ReanimatedRuntimeHandler::rtPtr;
        if (rt != nullptr) {
          try {
              jsi::Function f = rt->global().getPropertyAsObject(*rt, "global").getPropertyAsFunction(*rt, "handleEvent");
              f.call(*rt, jsi::String::createFromUtf8(*rt, type), tag, event.payloadFactory(*rt));
          } catch (std::exception e) {
              // do Nothing most likly the handler funciton is not registered yet
          }
        
        }
        return true;
      });
    [_surfacePresenter.scheduler addEventListener: _eventListener];
}

- (void)initialize {
}

// TODO()
- (void)setSurfacePresenter:(id<RCTSurfacePresenterStub>)surfacePresenter
{
  //NOOP
}

- (void)invalidate
{
    NSLog(@"SDFSDF");
    [_surfacePresenter.scheduler removeEventListener: _eventListener];
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

RCT_CUSTOM_VIEW_PROPERTY(inflatorId, NSString* , UIView){}
RCT_CUSTOM_VIEW_PROPERTY(initialIndex, double, UIView){}

RCT_EXPORT_VIEW_PROPERTY(onStartReached, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onEndReached, RCTDirectEventBlock)

- (UIView *)view
{
  return [[UIView alloc] init];
}

@end

@implementation MGTemplateContainerManager

RCT_EXPORT_MODULE(MGTemplateContainerComponentManager)

RCT_CUSTOM_VIEW_PROPERTY(inflatorId, NSString* , UIView){}

RCT_CUSTOM_VIEW_PROPERTY(names, NSArray<NSString*>* , UIView){}

- (UIView *)view
{
  return [[UIView alloc] init];
}

@end

@implementation MGTemplateInterceptorManager

RCT_EXPORT_MODULE(MGTemplateInterceptorComponentManager)

RCT_CUSTOM_VIEW_PROPERTY(inflatorId, NSString* , UIView){}

- (UIView *)view
{
  return [[UIView alloc] init];
}

@end
