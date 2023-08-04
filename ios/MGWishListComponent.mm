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
#import "MGOrchestrator.h"
#import "MGWishlistComponentDescriptor.h"
#import "RCTFabricComponentsPlugins.h"

#define MG_INITIAL_CONTENT_SIZE 100000

using namespace facebook::react;

@interface RCTScrollViewComponentView (MGWishList)

- (void)scrollViewDidScroll:(UIScrollView *)sv;

@end

@implementation MGWishListComponent {
  MGWishlistShadowNode::ConcreteState::Shared _sharedState;
  std::string _inflatorId;
  std::string _wishlistId;
  MGOrchestrator *_orchestrator;
  std::shared_ptr<const MGWishlistEventEmitter> _emitter;
  int _initialIndex;
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    // self.scrollView.showsVerticalScrollIndicator = NO;
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

- (BOOL)scrollViewShouldScrollToTop:(UIScrollView *)scrollView
{
  [self scrollToItem:0 animated:YES]; // Maybe it would be better to scroll to initial (which is not always 0)
  return NO;
}

- (void)setTemplates:(std::vector<std::shared_ptr<facebook::react::ShadowNode const>>)templates
           withNames:(std::vector<std::string>)names
{
  if (!_orchestrator) {
    self.scrollView.contentSize = CGSizeMake(self.frame.size.width, MG_INITIAL_CONTENT_SIZE);
    self.scrollView.contentOffset = CGPointMake(0, MG_INITIAL_CONTENT_SIZE / 2);

    std::shared_ptr<MGViewportCarerImpl> viewportCarer = _sharedState->getData().viewportCarer;
    _orchestrator = [[MGOrchestrator alloc] initWith:self.scrollView
                                          wishlistId:_wishlistId
                                       viewportCarer:viewportCarer];
  }

  [_orchestrator
      renderAsyncWithDimensions:{(float)self.scrollView.frame.size.width, (float)self.scrollView.frame.size.height}
             initialContentSize:MG_INITIAL_CONTENT_SIZE
                   initialIndex:_initialIndex
                      templates:templates
                          names:names
                     inflatorId:_inflatorId];
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
  [_orchestrator didScrollAsyncWithDimensions:{(float)scrollView.frame.size.width, (float)scrollView.frame.size.height}
                                contentOffset:scrollView.contentOffset.y
                                   inflatorId:_inflatorId];
}

- (void)prepareForRecycle
{
  _sharedState.reset();
  _orchestrator = nil;
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
