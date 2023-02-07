#import "MGWishListComponent.h"
#import <React/RCTConversions.h>
#import <React/RCTImageResponseDelegate.h>
#import <React/RCTImageResponseObserverProxy.h>

#import <React/RCTBridgeModule.h>
#import <React/RCTComponentViewFactory.h>
#import <react/renderer/components/rncore/EventEmitters.h>
#import <react/renderer/components/rncore/Props.h>
#include <react/renderer/components/wishlist/Props.h>
#include <react/renderer/components/wishlist/ShadowNodes.h>
#import "MGDIImpl.hpp"
#import "MGScrollViewOrchestrator.h"
#import "MGWishlistComponentDescriptor.h"
#import "RCTFabricComponentsPlugins.h"
#import "MGUIScheduleriOS.hpp"

using namespace facebook::react;

@interface RCTScrollViewComponentView (MGWishList)

- (void)scrollViewDidScroll:(UIScrollView *)sv;

@end

@implementation MGWishListComponent {
  MGWishlistShadowNode::ConcreteState::Shared _sharedState;
  bool alreadyRendered;
  std::string inflatorId;
  std::string _wishlistId;
  MGScrollViewOrchestrator *_orchestrator;
  std::shared_ptr<const MGWishlistEventEmitter> _emitter;
  int _initialIndex;
  std::shared_ptr<MGDIImpl> di;
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

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
  [super mountChildComponentView:childComponentView index:index];
}

- (void)setInflatorId:(std::string)nextInflatorId
{
  inflatorId = nextInflatorId;
}

- (void)setWishlistId:(std::string)wishlistId
{
  _wishlistId = wishlistId;
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

    di = std::make_shared<MGDIImpl>();
    std::shared_ptr<MGViewportCarerImpl> viewportCarer = _sharedState->getData().viewportCarer;
    viewportCarer->setDI(di);
    di->setViewportCarerImpl(viewportCarer);

    _orchestrator = [[MGScrollViewOrchestrator alloc] initWith:self.scrollView
                                                            di:di->getWeak()
                                                    inflatorId:inflatorId
                                                    wishlistId:_wishlistId];
    __weak MGScrollViewOrchestrator *weakOrchestrator = _orchestrator;
    di->setOrchestratorCppAdaper(std::make_shared<MGOrchestratorCppAdapter>(
        [=](float top, float bottom) { [weakOrchestrator edgesChangedWithTopEdge:top bottomEdge:bottom]; },
        [=]() { [weakOrchestrator requestVSync]; }));
    di->setDataBindingImpl(std::make_shared<MGDataBindingImpl>(_wishlistId, di->getWeak()));
    di->setWindowKeeper(std::make_shared<MGWindowKeeper>(di->getWeak()));
    di->setUIScheduler(std::make_shared<MGUIScheduleriOS>());

    [_orchestrator runWithTemplates:templates names:names initialIndex:_initialIndex];

    _orchestrator.delegate = self;

  } else {
    [_orchestrator notifyAboutNewTemplates:templates withNames:names inflatorId:inflatorId];
  }
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<MGWishlistComponentDescriptor>();
}

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wobjc-missing-super-calls"
- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  std::shared_ptr<const MGWishlistProps> wProps = std::static_pointer_cast<const MGWishlistProps>(props);
  _initialIndex = wProps->initialIndex;

  _props = wProps;
}
#pragma clang diagnostic pop

- (void)updateState:(State::Shared const &)state oldState:(State::Shared const &)oldState
{
  if (state == nullptr)
    return;
  auto newState = std::static_pointer_cast<MGWishlistShadowNode::ConcreteState const>(state);
  auto &data = newState->getData();
  _sharedState = newState;

  CGSize contentSize = RCTCGSizeFromSize(data.contentBoundingRect.size);

  self.containerView.frame = CGRect{RCTCGPointFromPoint(data.contentBoundingRect.origin), contentSize};
}

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wobjc-missing-super-calls"
- (void)updateEventEmitter:(EventEmitter::Shared const &)eventEmitter
{
  _emitter = std::static_pointer_cast<MGWishlistEventEmitter const>(eventEmitter);
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
  _orchestrator = nil;
  di = nullptr;
  alreadyRendered = NO;
  [super prepareForRecycle];
}

- (void)setBridge:(RCTBridge *)bridge
{
  // TODO here you can intercept uiManager by registering fake surface
  // bridge.surfacePresentsr
}

- (void)handleCommand:(const NSString *)commandName args:(const NSArray *)args
{
  RCTMGWishlistHandleCommand(self, commandName, args);
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

Class<RCTComponentViewProtocol> MGWishlistCls(void)
{
  return MGWishListComponent.class;
}
