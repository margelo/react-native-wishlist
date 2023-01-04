#import "MGWishListComponent.h"
#import <React/RCTConversions.h>
#import <React/RCTImageResponseDelegate.h>
#import <React/RCTImageResponseObserverProxy.h>

#import <react/renderer/components/rncore/EventEmitters.h>
#import <react/renderer/components/rncore/Props.h>
#import "RCTFabricComponentsPlugins.h"
#import "WishlistComponentDescriptors.h"
#import "WishlistProps.h"
#import "WishlistShadowNodes.h"
#import <React/RCTBridgeModule.h>
#import <React/RCTComponentViewFactory.h>

using namespace facebook::react;

@interface RCTScrollViewComponentView (MGWishList)
   
- (void)scrollViewDidScroll:(UIScrollView*)sv;

@end

@implementation MGWishListComponent{
    WishlistShadowNode::ConcreteState::Shared _sharedState;
    bool alreadyRendered;
    std::string inflatorId;
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
      self.scrollView.delaysContentTouches = NO;
      self.scrollView.canCancelContentTouches = true;
      alreadyRendered = false;
  }
  return self;
}

-(void) setInflatorId:(std::string)nextInflatorId {
  inflatorId = nextInflatorId;
}

-(void) setTemplates:(std::vector<std::shared_ptr<facebook::react::ShadowNode const>>)templates withNames:(std::vector<std::string>)names
{
    if (!alreadyRendered && names.size() > 0 && names.size() == templates.size()) {
        alreadyRendered = true;
        CGRect frame = self.frame;
        self.scrollView.contentSize = CGSizeMake(frame.size.width, 1000000);
        _sharedState->getData().viewportObserver->boot(
                                          5000,
                                          frame.size.height, frame.size.width, 5000, 10, templates, names, inflatorId);
    } else {
        CGRect frame = self.frame;
        self.scrollView.contentSize = CGSizeMake(frame.size.width, 1000000);
        _sharedState->getData().viewportObserver->update(
                                          frame.size.height, frame.size.width, templates, names, inflatorId);
    }
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<WishlistComponentDescriptor>();
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    inflatorId = std::dynamic_pointer_cast<const WishlistProps>(props)->inflatorId;
    //[super updateProps:props oldProps:oldProps];
    _eventEmitter = nil;
}

- (void)updateState:(State::Shared const &)state oldState:(State::Shared const &)oldState
{
    _eventEmitter = nil; // temporary TODO fix this
    if (state == nullptr) return;
    auto newState = std::static_pointer_cast<WishlistShadowNode::ConcreteState const>(state);
    auto &data = newState->getData();
    _sharedState = newState;
    self.scrollView.contentOffset = CGPointMake(0, data.viewportObserver->offset);

  CGSize contentSize = RCTCGSizeFromSize(data.contentBoundingRect.size);

  self.containerView.frame = CGRect{RCTCGPointFromPoint(data.contentBoundingRect.origin), contentSize};
}

- (void)scrollViewDidScroll:(UIScrollView *)scrollView
{
    if (_sharedState == nullptr) {
        return;
    }
    //[super scrollViewDidScroll: scrollView];
   // NSLog(@"offset: %f", scrollView.contentOffset.y);
    _sharedState->getData().viewportObserver->reactToOffsetChange(scrollView.contentOffset.y);
    //TODO update list
}

- (void)prepareForRecycle
{
  _sharedState.reset();
  [super prepareForRecycle];
}

-(void)setBridge:(RCTBridge *)bridge
{
    // TODO here you can intercept uiManager by registering fake surface
  //bridge.surfacePresentsr
};

@end
