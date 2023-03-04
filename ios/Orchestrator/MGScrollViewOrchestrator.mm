#import "MGScrollViewOrchestrator.h"
#include <set>
#import "MGDIIOS.h"
#include "WishlistJsRuntime.h"

using namespace Wishlist;

@implementation MGScrollViewOrchestrator {
  UIScrollView *_scrollView;
  CADisplayLink *_displayLink;

  // Events
  NSMutableArray<PanEvent *> *_touchEvents;
  CGFloat _lastTranslation;
  BOOL _doWeHaveOngoingEvent;
  BOOL areEventsBlocked;

  // PendingTemplates
  std::vector<std::shared_ptr<facebook::react::ShadowNode const>> _pendingTemplates;
  std::vector<std::string> _pendingNames;

  // ViewportObserer
  std::weak_ptr<MGDIIOS> _di;
  std::string _inflatorId;
  BOOL _needsVSync;

  id<MGScrollAnimation> _currentAnimation;
  std::string _wishlistId;

  // content edges
  CGFloat topElementY;
  CGFloat bottomElementBottomEdgeY;
}

- (instancetype)initWith:(UIScrollView *)scrollView
                      di:(std::weak_ptr<MGDIIOS>)di
              inflatorId:(std::string)inflatorId
              wishlistId:(std::string)wishlistId
{
  if (self = [super init]) {
    _scrollView = scrollView;
    _wishlistId = wishlistId;

    _displayLink = [CADisplayLink displayLinkWithTarget:self selector:@selector(handleVSync:)];
    [_displayLink addToRunLoop:NSRunLoop.currentRunLoop forMode:NSDefaultRunLoopMode];
    [_displayLink setPaused:YES];

    areEventsBlocked = YES;

    _di = di;

    _scrollView.contentOffset = CGPointMake(0, 500000);

    _doWeHaveOngoingEvent = NO;
    _inflatorId = inflatorId;
    _touchEvents = [NSMutableArray new];
    _needsVSync = NO;
  }
  return self;
}

- (void)runWithTemplates:(std::vector<std::shared_ptr<facebook::react::ShadowNode const>>)templates
                   names:(std::vector<std::string>)names
            initialIndex:(int)initialIndex
{
  _di.lock()->getViewportCarer()->initialRenderAsync(
      {(float)_scrollView.frame.size.width, (float)_scrollView.frame.size.height},
      500000,
      initialIndex,
      templates,
      names,
      _inflatorId);
}

- (void)maybeRegisterForNextVSync
{
  if ([_displayLink isPaused]) {
    [_displayLink setPaused:NO];
  }
}

- (void)handleVSync:(CADisplayLink *)displayLink
{
  _needsVSync = NO;
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

  std::shared_ptr<MGDI> di = _di.lock();
  if (di != nullptr) {
    auto templatesCopy = std::vector<std::shared_ptr<facebook::react::ShadowNode const>>();
    auto namesCopy = std::vector<std::string>();

    namesCopy.swap(_pendingNames);
    templatesCopy.swap(_pendingTemplates);

    di->getViewportCarer()->didScrollAsync(
        {(float)_scrollView.frame.size.width, (float)_scrollView.frame.size.height},
        templatesCopy,
        namesCopy,
        ((float)_scrollView.contentOffset.y),
        _inflatorId);
  }

  [self avoidOverscroll];

  // pause Vsync listener if there is nothing to do
  if ([_touchEvents count] == 0 && _currentAnimation == nil && !_needsVSync) {
    [_displayLink setPaused:YES];
  }
}

- (void)notifyAboutEvent:(PanEvent *)event
{
  if (areEventsBlocked) {
    return;
  }
  [_touchEvents addObject:event];
  [self maybeRegisterForNextVSync];
}

- (void)notifyAboutNewTemplates:(std::vector<std::shared_ptr<facebook::react::ShadowNode const>>)templates
                      withNames:(std::vector<std::string>)names
                     inflatorId:(std::string)inflatorId
{
  _inflatorId = inflatorId;
  [self requestVSync];
}

- (void)scrollToItem:(int)index
{
  if (_doWeHaveOngoingEvent) {
    return;
  }
  _currentAnimation = [[MGScrollToItemAnimation alloc] initWithIndex:index
                                                              offset:_scrollView.contentOffset.y
                                                           itemSight:_di.lock()->getAnimationsSight()];

  [self requestVSync];
}

- (void)requestVSync
{
  _needsVSync = YES;
  [self maybeRegisterForNextVSync];
}

- (void)edgesChangedWithTopEdge:(float)topEdge bottomEdge:(float)bottomEdge
{
  topElementY = topEdge;
  bottomElementBottomEdgeY = bottomEdge;
  areEventsBlocked = NO;

  [self avoidOverscroll];
}

- (void)avoidOverscroll
{
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
  }
}

- (void)dealloc
{
  _scrollView = nil;
  [_displayLink invalidate];
}

@end

@implementation PanEvent

@end
