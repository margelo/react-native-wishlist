#import "MGWishListComponent.h"
#import <React/RCTConversions.h>
#import <React/RCTImageResponseDelegate.h>
#import <React/RCTImageResponseObserverProxy.h>

#import <React/RCTBridgeModule.h>
#import <React/RCTComponentViewFactory.h>
#import <react/renderer/components/rncore/EventEmitters.h>
#import <react/renderer/components/rncore/Props.h>
#import "MGScrollViewOrchestrator.h"
#import "RCTFabricComponentsPlugins.h"
#import "WishlistComponentDescriptors.h"
#import "WishlistProps.h"
#import "WishlistShadowNodes.h"

using namespace facebook::react;

@interface RCTScrollViewComponentView (MGWishList)

- (void)scrollViewDidScroll:(UIScrollView *)sv;

@end

@implementation MGWishListComponent {
  WishlistShadowNode::ConcreteState::Shared _sharedState;
  bool alreadyRendered;
  std::string inflatorId;
  MGScrollViewOrchestrator *_orchestrator;
  std::shared_ptr<const WishlistEventEmitter> _emitter;
  int _initialIndex;
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    self.scrollView.delaysContentTouches = NO;
    self.scrollView.canCancelContentTouches = true;
    alreadyRendered = false;

    [self.scrollView removeGestureRecognizer:self.scrollView.panGestureRecognizer];

    UIPanGestureRecognizer *customR = [UIPanGestureRecognizer new];
    [customR setMinimumNumberOfTouches:1];
    [self.scrollView addGestureRecognizer:customR];
    [customR addTarget:self action:@selector(handlePan:)];
  }
  return self;
}

- (void)setInflatorId:(std::string)nextInflatorId
{
  inflatorId = nextInflatorId;
}

- (void)handlePan:(UIPanGestureRecognizer *)gesture
{
  if (_orchestrator != nil) {
    PanEvent *panEvent = [PanEvent new];
    panEvent.state = gesture.state;
    panEvent.velocity = [gesture velocityInView:self].y;
    panEvent.translation = [gesture translationInView:self.scrollView].y;
    [_orchestrator notifyAboutEvent:panEvent];
  }
}

- (BOOL)scrollViewShouldScrollToTop:(UIScrollView *)scrollView
{
  [self scrollToItem:0 animated:YES]; // Maybe it would be better to scroll to initial (which is not always 0)
  return NO;
}

- (void)setTemplates:(std::vector<std::shared_ptr<facebook::react::ShadowNode const>>)templates
           withNames:(std::vector<std::string>)names
{
  if (!alreadyRendered && names.size() > 0 && names.size() == templates.size()) {
    alreadyRendered = true;
    CGRect frame = self.frame;

    self.scrollView.contentSize = CGSizeMake(frame.size.width, 10000000);
    self.scrollView.frame =
        CGRectMake(self.scrollView.frame.origin.x, self.scrollView.frame.origin.y, frame.size.width, frame.size.height);

    _orchestrator = [[MGScrollViewOrchestrator alloc] initWith:self.scrollView
                                                     templates:templates
                                                         names:names
                                              viewportObserver:_sharedState->getData().viewportObserver
                                                    inflatorId:inflatorId
                                                  initialIndex:_initialIndex];

    _orchestrator.delegate = self;

  } else {
    [_orchestrator notifyAboutNewTemplates:templates withNames:names inflatorId:inflatorId];
  }
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<WishlistComponentDescriptor>();
}

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wobjc-missing-super-calls"
- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  std::shared_ptr<const WishlistProps> wProps = std::static_pointer_cast<const WishlistProps>(props);
  inflatorId = wProps->inflatorId;
  _initialIndex = wProps->initialIndex;
}
#pragma clang diagnostic pop

- (void)updateState:(State::Shared const &)state oldState:(State::Shared const &)oldState
{
  if (state == nullptr)
    return;
  auto newState = std::static_pointer_cast<WishlistShadowNode::ConcreteState const>(state);
  auto &data = newState->getData();
  _sharedState = newState;

  CGSize contentSize = RCTCGSizeFromSize(data.contentBoundingRect.size);

  self.containerView.frame = CGRect{RCTCGPointFromPoint(data.contentBoundingRect.origin), contentSize};
}

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wobjc-missing-super-calls"
- (void)updateEventEmitter:(EventEmitter::Shared const &)eventEmitter
{
  _emitter = std::static_pointer_cast<WishlistEventEmitter const>(eventEmitter);
}
#pragma clang diagnostic pop

- (void)scrollViewDidScroll:(UIScrollView *)scrollView
{
  if (_sharedState == nullptr) {
    return;
  }
}

- (void)prepareForRecycle
{
  _sharedState.reset();
  [super prepareForRecycle];
}

- (void)setBridge:(RCTBridge *)bridge
{
  // TODO here you can intercept uiManager by registering fake surface
  // bridge.surfacePresentsr
}

- (void)handleCommand:(const NSString *)commandName args:(const NSArray *)args
{
  MGWishlistHandleCommand(self, commandName, args);
}

- (void)scrollToItem:(NSInteger)index animated:(BOOL)animated
{
  if (animated && _orchestrator != nil) {
    [_orchestrator scrollToItem:index];
  }

  if (!animated) {
    // TODO (restart Wishlist with different initial index)
  }
}

- (void)onEndReached
{
  if (_emitter) {
    _emitter->onEndReached({});
  }
}

- (void)onStartReached
{
  if (_emitter) {
    _emitter->onStartReached({});
  }
}

@end
