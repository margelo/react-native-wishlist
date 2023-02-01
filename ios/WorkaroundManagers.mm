#import "WorkaroundManagers.h"
#import <React/RCTBridge+Private.h>
#import <React/RCTBridge.h>
#import <React/RCTComponentViewFactory.h>
#import <React/RCTInitializing.h>
#import <React/RCTScheduler.h>
#import <React/RCTSurfacePresenter.h>
#import <React/RCTSurfacePresenterStub.h>
#import <ReactCommon/RCTTurboModule.h>
#include <jsi/JSIDynamic.h>
#include <jsi/jsi.h>
#include <react/renderer/components/view/ViewEventEmitter.h>
#include <react/renderer/core/EventListener.h>
#include "MGObjCJSIUtils.h"
#import "MGWishListComponent.h"
#include "WishlistJsRuntime.h"

using EventListener = facebook::react::EventListener;
using RawEvent = facebook::react::RawEvent;
using namespace Wishlist;

@interface Workaround : NSObject <RCTBridgeModule, RCTInvalidating, RCTInitializing, RCTEventDispatcherObserver>

@property (nonatomic, weak) RCTBridge *bridge;

@end

@implementation Workaround {
  __weak RCTSurfacePresenter *_surfacePresenter;
  std::shared_ptr<EventListener> _eventListener;
  dispatch_queue_t wishlistQueue;
}

RCT_EXPORT_MODULE(Workaround);

- (void)setBridge:(RCTBridge *)bridge
{
  dispatch_queue_attr_t qos =
      dispatch_queue_attr_make_with_qos_class(DISPATCH_QUEUE_SERIAL, QOS_CLASS_USER_INITIATED, -1);
  wishlistQueue = dispatch_queue_create("wishlistqueue", qos);
  _bridge = bridge;
  _surfacePresenter = _bridge.surfacePresenter;
  __weak __typeof(self) weakSelf = self;
  _eventListener = std::make_shared<EventListener>([weakSelf](const RawEvent &event) -> bool {
    __typeof(self) strongSelf = weakSelf;
    if (!strongSelf) {
      return false;
    }
    return [strongSelf handleFabricEvent:event];
  });
  [_surfacePresenter.scheduler addEventListener:_eventListener];

  [[bridge.moduleRegistry moduleForName:"EventDispatcher" lazilyLoadIfNecessary:YES] addDispatchObserver:self];

  RCTCxxBridge *cxxBridge = (RCTCxxBridge *)_bridge;
  auto callInvoker = cxxBridge.jsCallInvoker;
  facebook::jsi::Runtime *jsRuntime = (facebook::jsi::Runtime *)cxxBridge.runtime;

  WishlistJsRuntime::getInstance().initialize(
      jsRuntime,
      [=](std::function<void()> &&f) {
        __block auto retainedWork = std::move(f);
        dispatch_async(wishlistQueue, ^{
          retainedWork();
        });
      },
      [=](std::function<void()> &&f) { callInvoker->invokeAsync(std::move(f)); });
}

- (void)eventDispatcherWillDispatchEvent:(id<RCTEvent>)event
{
  dispatch_async(wishlistQueue, ^{
    [self handlePaperEvent:event];
  });
}

- (bool)handleFabricEvent:(const RawEvent &)event
{
  if (event.eventTarget == nullptr) {
    // TODO Scheduler reset
    return false;
  }
  std::string type = event.type;
  int tag = event.eventTarget->getTag();
  if (tag >= 0)
    return false;

  WishlistJsRuntime::getInstance().accessRuntime([=](jsi::Runtime &rt) {
    [self sendEventWithType:jsi::String::createFromUtf8(rt, type) tag:tag payload:event.payloadFactory(rt)];
  });

  return true;
}

- (void)handlePaperEvent:(id<RCTEvent>)event
{
  NSNumber *tag = event.viewTag;
  NSString *type = event.eventName;

  WishlistJsRuntime::getInstance().accessRuntime([=](jsi::Runtime &rt) {
    [self sendEventWithType:jsi::String::createFromUtf8(rt, [type UTF8String])
                        tag:tag.intValue
                    payload:convertObjCObjectToJSIValue(rt, event.arguments[2])];
  });
}

- (void)sendEventWithType:(const jsi::String &)type tag:(int)tag payload:(const jsi::Value &)payload
{
  auto &rt = WishlistJsRuntime::getInstance().getRuntime();
  try {
    jsi::Function f = rt.global().getPropertyAsObject(rt, "global").getPropertyAsFunction(rt, "handleEvent");
    f.call(rt, type, tag, payload);
  } catch (std::exception &error) {
    RCTLogError(@"%@", [NSString stringWithUTF8String:error.what()]);
  }
}

- (void)initialize
{
}

// TODO()
- (void)setSurfacePresenter:(id<RCTSurfacePresenterStub>)surfacePresenter
{
  // NOOP
}

- (void)invalidate
{
  [_surfacePresenter.scheduler removeEventListener:_eventListener];
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(install)
{
  // This is only used to force the native module to load and setBridge to be called.
  return @true;
}

@end

@implementation MGWishlistComponentManager

RCT_EXPORT_MODULE(MGWishlist)

RCT_CUSTOM_VIEW_PROPERTY(inflatorId, NSString *, UIView) {}
RCT_CUSTOM_VIEW_PROPERTY(initialIndex, double, UIView) {}

RCT_EXPORT_VIEW_PROPERTY(onStartReached, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onEndReached, RCTDirectEventBlock)

- (UIView *)view
{
  return [[UIView alloc] init];
}

@end

@implementation MGTemplateContainerManager

RCT_EXPORT_MODULE(MGTemplateContainer)

RCT_CUSTOM_VIEW_PROPERTY(inflatorId, NSString *, UIView) {}

RCT_CUSTOM_VIEW_PROPERTY(wishlistId, NSString *, UIView) {}

RCT_CUSTOM_VIEW_PROPERTY(names, NSArray<NSString *> *, UIView) {}

- (UIView *)view
{
  return [[UIView alloc] init];
}

@end

@implementation MGTemplateInterceptorManager

RCT_EXPORT_MODULE(MGTemplateInterceptor)

RCT_CUSTOM_VIEW_PROPERTY(inflatorId, NSString *, UIView) {}

- (UIView *)view
{
  return [[UIView alloc] init];
}

@end
