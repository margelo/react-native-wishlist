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
#import "MGDIIOS.h"
#import "MGDataBindingImpl.hpp"
#import "MGErrorHandlerIOS.h"
#import "MGOrchestratorCPPAdapter.hpp"
#import "MGScrollViewOrchestrator.h"
#import "MGUIScheduleriOS.hpp"
#import "MGWindowKeeper.hpp"
#import "MGWishlistComponentDescriptor.h"
#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

@interface RCTScrollViewComponentView (MGWishList)

- (void)scrollViewDidScroll:(UIScrollView *)sv;

@end

@implementation MGWishListComponent {
  MGWishlistShadowNode::ConcreteState::Shared _sharedState;
  bool _alreadyRendered;
  std::string _inflatorId;
  std::string _wishlistId;
  MGScrollViewOrchestrator *_orchestrator;
  std::shared_ptr<const MGWishlistEventEmitter> _emitter;
  int _initialIndex;
  std::shared_ptr<MGDIIOS> _di;
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    self.scrollView.delaysContentTouches = NO;
    self.scrollView.canCancelContentTouches = true;
    _alreadyRendered = false;

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
  _inflatorId = nextInflatorId;
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
  if (!_alreadyRendered && names.size() > 0 && names.size() == templates.size()) {
    _alreadyRendered = true;
    CGRect frame = self.frame;

    self.scrollView.contentSize = CGSizeMake(frame.size.width, 10000000);
    self.scrollView.frame =
        CGRectMake(self.scrollView.frame.origin.x, self.scrollView.frame.origin.y, frame.size.width, frame.size.height);

    _di = std::make_shared<MGDIIOS>();
    auto weakDI = std::weak_ptr<MGDIIOS>(_di);
    std::shared_ptr<MGViewportCarerImpl> viewportCarer = _sharedState->getData().viewportCarer;
    viewportCarer->setDI(_di);
    _di->setViewportCarer(viewportCarer);

    _orchestrator = [[MGScrollViewOrchestrator alloc] initWith:self.scrollView
                                                            di:weakDI
                                                    inflatorId:_inflatorId
                                                    wishlistId:_wishlistId];
    __weak MGScrollViewOrchestrator *weakOrchestrator = _orchestrator;
    auto orchestratorAdapter = std::make_shared<MGOrchestratorCppAdapter>(
        [=](float top, float bottom) { [weakOrchestrator edgesChangedWithTopEdge:top bottomEdge:bottom]; },
        [=]() { [weakOrchestrator requestVSync]; });
    _di->setVSyncRequester(orchestratorAdapter);
    _di->setBoundingBoxObserver(orchestratorAdapter);
    _di->setDataBinding(std::make_shared<MGDataBindingImpl>(_wishlistId, weakDI));
    auto windowKeeper = std::make_shared<MGWindowKeeper>(weakDI);
    _di->setAnimationsSight(windowKeeper);
    _di->setUIScheduler(std::make_shared<MGUIScheduleriOS>());
    _di->setErrorHandler(std::make_shared<MGErrorHandlerIOS>());

    viewportCarer->setListener(std::weak_ptr(windowKeeper));

    [_orchestrator runWithTemplates:templates names:names initialIndex:_initialIndex];

  } else {
    [_orchestrator notifyAboutNewTemplates:templates withNames:names inflatorId:_inflatorId];
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
  _di = nullptr;
  _alreadyRendered = NO;
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

@end

Class<RCTComponentViewProtocol> MGWishlistCls(void)
{
  return MGWishListComponent.class;
}
