#import "MGScrollViewOrchestrator.h"
#include <set>
#include "WishlistJsRuntime.h"
#import <chrono>
#import <iostream>
#import <atomic>
#import <memory>

using namespace Wishlist;

@implementation MGScrollViewOrchestrator {
  UIScrollView *_scrollView;
  CADisplayLink *_displayLink;

  // Events
  NSMutableArray<PanEvent *> *_touchEvents;
  CGFloat _lastTranslation;
  BOOL _doWeHaveOngoingEvent;

  // PendingTemplates
  BOOL _doWeHavePendingTemplates;
  std::vector<std::shared_ptr<facebook::react::ShadowNode const>> _pendingTemplates;
  std::vector<std::string> _pendingNames;

  // ViewportObserer
  std::shared_ptr<ViewportObserver> _viewportObserver;
  std::string _inflatorId;
  BOOL _needToSyncUpWithJS;

  id<MGScrollAnimation> _currentAnimation;
  std::string _wishlistId;
    
  std::shared_ptr<std::atomic<bool>> heavyWork;
}

- (instancetype)initWith:(UIScrollView *)scrollView
               templates:(std::vector<std::shared_ptr<facebook::react::ShadowNode const>>)templates
                   names:(std::vector<std::string>)names
        viewportObserver:(std::shared_ptr<ViewportObserver>)vo
              inflatorId:(std::string)inflatorId
            initialIndex:(int)initialIndex
              wishlistId:(std::string)wishlistId
{
  if (self = [super init]) {
      heavyWork = std::make_shared<std::atomic<bool>>(false);
      
    _scrollView = scrollView;
    _wishlistId = wishlistId;

    [self registerWishlistBinding];

    _displayLink = [CADisplayLink displayLinkWithTarget:self selector:@selector(handleVSync:)];
    [_displayLink addToRunLoop:NSRunLoop.currentRunLoop forMode:NSDefaultRunLoopMode];
    [_displayLink setPaused:YES];

    _viewportObserver = vo;

    _scrollView.contentOffset = CGPointMake(0, 500000);
    _viewportObserver->boot( // TODO Mostlikly needs to adujst offset?
        500000,
        _scrollView.frame.size.height,
        _scrollView.frame.size.width,
        500000,
        initialIndex,
        templates,
        names,
        inflatorId);

    _doWeHavePendingTemplates = NO;
    _doWeHaveOngoingEvent = NO;
    _inflatorId = inflatorId;
    _touchEvents = [NSMutableArray new];
    _needToSyncUpWithJS = NO;

    [self adjustOffsetIfInitialValueIsCloseToEnd];
  }
  return self;
}

// when someone sets initial element to last element we need to correct an offset
// because otherwise we will only display first element
- (void)adjustOffsetIfInitialValueIsCloseToEnd
{
  CGFloat topElementY = _viewportObserver->window[0].offset;
  CGFloat bottomElementBottomEdgeY = _viewportObserver->window.back().offset + _viewportObserver->window.back().height;

  CGFloat topViewportEdge = _scrollView.contentOffset.y;
  CGFloat bottomViewPortEdge = topViewportEdge + _scrollView.frame.size.height;

  if (bottomElementBottomEdgeY < bottomViewPortEdge) {
    CGFloat diff = bottomElementBottomEdgeY - bottomViewPortEdge;
    CGPoint oldOffset = _scrollView.contentOffset;

    _scrollView.contentOffset = CGPointMake(oldOffset.x, oldOffset.y + diff);
    bottomViewPortEdge += diff;
    topViewportEdge += diff;
  }

  // topElementY > topViewPortEdge (top overscroll)
  if (topElementY > topViewportEdge) {
    CGFloat diff = topElementY - topViewportEdge;
    CGPoint oldOffset = _scrollView.contentOffset;

    _scrollView.contentOffset = CGPointMake(oldOffset.x, oldOffset.y + diff);
    bottomViewPortEdge += diff;
    topViewportEdge += diff;
    _currentAnimation = nil;

    _viewportObserver->reactToOffsetChange(_scrollView.contentOffset.y);
  }
}

- (void)maybeRegisterForNextVSync
{
    [self startSomeBackgroundWork];
  if ([_displayLink isPaused]) {
    [_displayLink setPaused:NO];
  }
}

- (void)handleVSync:(CADisplayLink *)displayLink
{
    auto start = std::chrono::high_resolution_clock::now();
  CGFloat yDiff = 0;
  // Check Touch Events
  if (_touchEvents.count > 0) {
    _currentAnimation = nil;
    for (PanEvent *event in _touchEvents) {
      if (event.state == UIGestureRecognizerStateBegan) {
        _lastTranslation = 0;
        _doWeHaveOngoingEvent = YES;
      }
      if (event.state == UIGestureRecognizerStateChanged) {
        yDiff = event.translation - _lastTranslation;
        _lastTranslation = event.translation;
      }
      if (event.state == UIGestureRecognizerStateEnded) {
        _doWeHaveOngoingEvent = NO;
        // start Animation with velocity
        _currentAnimation = [[MGDecayAnimation alloc] initWithVelocity:event.velocity];
      }
    }

    [_touchEvents removeAllObjects];
  }
  // Run Animations
  if (_currentAnimation != nil) {
    if ([_currentAnimation needsSetup]) {
      [_currentAnimation setupWithTimestamp:displayLink.timestamp];
    }
    yDiff += [_currentAnimation getDiffWithTimestamp:displayLink.timestamp];
    if ([_currentAnimation isFinished]) {
      _currentAnimation = nil;
    }
  }

  // Update content Offset
  if (yDiff != 0) {
    CGPoint oldOffset = _scrollView.contentOffset;
    _scrollView.contentOffset = CGPointMake(oldOffset.x, oldOffset.y - yDiff);
  }

  if (_needToSyncUpWithJS) {
    [self syncUpWithJS:_viewportObserver->getBinding()];
    _viewportObserver->updateDirtyItems();
    _needToSyncUpWithJS = NO;
  }

  // update teamplates if needed
  if (_doWeHavePendingTemplates) {
    _viewportObserver->update(
        _scrollView.frame.size.height, _scrollView.frame.size.width, _pendingTemplates, _pendingNames, _inflatorId);
    _doWeHavePendingTemplates = NO;
  }

  // cover Viewport if possible
  _viewportObserver->reactToOffsetChange(_scrollView.contentOffset.y);

  // update offset if new elements require it
  CGFloat topElementY = _viewportObserver->window[0].offset;
  CGFloat bottomElementBottomEdgeY = _viewportObserver->window.back().offset + _viewportObserver->window.back().height;

  CGFloat topViewportEdge = _scrollView.contentOffset.y;
  CGFloat bottomViewPortEdge = topViewportEdge + _scrollView.frame.size.height;

  // ugly casework
  // topElementY < topViewportEdge (possibly new elementsOnTheTop)
  /* stop overscrollAnimation */

  // bottomElementY < bottomViewportEdge (bottom overscroll)
  if (bottomElementBottomEdgeY < bottomViewPortEdge) {
    CGFloat diff = bottomElementBottomEdgeY - bottomViewPortEdge;
    CGPoint oldOffset = _scrollView.contentOffset;

    _scrollView.contentOffset = CGPointMake(oldOffset.x, oldOffset.y + diff);
    bottomViewPortEdge += diff;
    topViewportEdge += diff;

    _currentAnimation = nil;
    if (_delegate) {
      [_delegate onEndReached];
    }
  }

  // topElementY > topViewPortEdge (top overscroll)
  if (topElementY > topViewportEdge) {
    CGFloat diff = topElementY - topViewportEdge;
    CGPoint oldOffset = _scrollView.contentOffset;

    _scrollView.contentOffset = CGPointMake(oldOffset.x, oldOffset.y + diff);
    bottomViewPortEdge += diff;
    topViewportEdge += diff;
    _currentAnimation = nil;

    if (_delegate) {
      [_delegate onStartReached];
    }
  }

  // pause Vsync listener if there is nothing to do
  if ([_touchEvents count] == 0 && _currentAnimation == nil && !_doWeHavePendingTemplates && !_needToSyncUpWithJS) {
    [_displayLink setPaused:YES];
      [self endBackgroundWork];
  }
    
  auto end = std::chrono::high_resolution_clock::now();
    auto d = std::chrono::duration_cast<std::chrono::microseconds>(end-start);
    std::cout << "uuuu vsync took" << d.count() << " " << std::endl;
}

- (void)notifyAboutEvent:(PanEvent *)event
{
  [_touchEvents addObject:event];
  [self maybeRegisterForNextVSync];
}

- (void)notifyAboutNewTemplates:(std::vector<std::shared_ptr<facebook::react::ShadowNode const>>)templates
                      withNames:(std::vector<std::string>)names
                     inflatorId:(std::string)inflatorId
{
  _inflatorId = inflatorId;
  _pendingTemplates = templates;
  _pendingNames = names;
  _doWeHavePendingTemplates = YES;
  [self maybeRegisterForNextVSync];
}

- (void)scrollToItem:(int)index
{
  if (_doWeHaveOngoingEvent) {
    return;
  }
  _currentAnimation = [[MGScrollToItemAnimation alloc] initWithIndex:index
                                                              offset:_scrollView.contentOffset.y
                                                    viewportObserver:_viewportObserver];

  [self maybeRegisterForNextVSync];
}

- (void)scheduleSyncUp
{
  _needToSyncUpWithJS = YES;
  [self maybeRegisterForNextVSync];
}

- (void)syncUpWithJS:(jsi::Value)observerBinding
{
  auto &rt = WishlistJsRuntime::getInstance().getRuntime();
  jsi::Object global = rt.global().getPropertyAsObject(rt, "global");
  if (!global.hasProperty(rt, "wishlists")) {
    global.setProperty(rt, "wishlists", jsi::Object(rt));
  }

  jsi::Object wishlists = global.getPropertyAsObject(rt, "wishlists");
  jsi::Object obj = wishlists.getPropertyAsObject(rt, _wishlistId.c_str());
  jsi::Value val = obj.getProperty(rt, "listener");
  if (val.isObject()) {
    jsi::Function f = val.getObject(rt).getFunction(rt);
    f.call(rt, std::move(observerBinding));
  }
}

- (void)registerWishlistBinding
{
  auto &rt = WishlistJsRuntime::getInstance().getRuntime();
  jsi::Object global = rt.global().getPropertyAsObject(rt, "global");
  if (!global.hasProperty(rt, "wishlists")) {
    global.setProperty(rt, "wishlists", jsi::Object(rt));
  }

  jsi::Object wishlists = global.getPropertyAsObject(rt, "wishlists");

  jsi::Object binding(rt);
  if (wishlists.getProperty(rt, _wishlistId.c_str()).isObject()) {
    binding = wishlists.getProperty(rt, _wishlistId.c_str()).asObject(rt);
  }
  __weak MGScrollViewOrchestrator *weakSelf = self;
  binding.setProperty(
      rt,
      "scheduleSyncUp",
      jsi::Function::createFromHostFunction(
          rt,
          jsi::PropNameID::forAscii(rt, "scheduleSyncUp"),
          1,
          [=](jsi::Runtime &rt, const jsi::Value &thisValue, const jsi::Value *args, size_t count) -> jsi::Value {
            [weakSelf scheduleSyncUp];
            return jsi::Value::undefined();
          }));

  wishlists.setProperty(rt, _wishlistId.c_str(), binding);
  NSLog(@"registered binding for wishlistId: %@", [NSString stringWithUTF8String:_wishlistId.c_str()]);
}

- (void)unregisterWishlistBinding
{
  auto &rt = WishlistJsRuntime::getInstance().getRuntime();
  jsi::Object global = rt.global().getPropertyAsObject(rt, "global");
  jsi::Object wishlists = global.getPropertyAsObject(rt, "wishlists");
  wishlists.setProperty(rt, _wishlistId.c_str(), jsi::Value::undefined());
}

- (void)dealloc
{
  [self unregisterWishlistBinding];
  _scrollView = nil;
  [_displayLink invalidate];
  [self endBackgroundWork];
}

- (void)startSomeBackgroundWork
{
    if (!(*heavyWork)) {
        std::cout << "uuuu heavy work start" << std::endl;
        *heavyWork = true;
        std::thread thread([=]() {
            int x = 3;
            while (*heavyWork) {
                x *= 4;
                x %= 1235464;
                
            }
        });
        thread.detach();
    }
}

- (void)endBackgroundWork
{
    (*heavyWork) = false;
    std::cout << "uuuu heavy work end" << std::endl;
}

@end

@implementation PanEvent

@end
