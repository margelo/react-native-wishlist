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
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
      self.scrollView.delaysContentTouches = NO;
      self.scrollView.canCancelContentTouches = true;
  }
  return self;
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<WishlistComponentDescriptor>();
}


- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    NSLog(@"updateProps");
  const auto &oldSliderProps = *std::static_pointer_cast<const WishlistProps>(_props);
  const auto &newSliderProps = *std::static_pointer_cast<const WishlistProps>(props);
    int z = 3;
    self.scrollView.contentSize = CGSizeMake(1000, 100000);
    _eventEmitter = nil; // temporary TODO fix this
    //self.contentSize = 10000;
    //self.con
}

- (void)updateState:(State::Shared const &)state oldState:(State::Shared const &)oldState
{
    _eventEmitter = nil; // temporary TODO fix this
    if (state == nullptr) return;
    auto newState = std::static_pointer_cast<WishlistShadowNode::ConcreteState const>(state);
    auto &data = newState->getData();
    _sharedState = newState;
    self.scrollView.contentOffset = CGPointMake(0, data.viewportObserver->offset);//

  /* auto contentOffset = RCTCGPointFromPoint(data.contentOffset);
  if (!oldState && !CGPointEqualToPoint(contentOffset, CGPointZero)) {
    _scrollView.contentOffset = contentOffset;
  } */

  CGSize contentSize = RCTCGSizeFromSize(data.contentBoundingRect.size);

  self.containerView.frame = CGRect{RCTCGPointFromPoint(data.contentBoundingRect.origin), contentSize};

  /*[self _preserveContentOffsetIfNeededWithBlock:^{
    self->_scrollView.contentSize = contentSize;
  }];*/
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



Class<RCTComponentViewProtocol> MGWishListCls(void)
{
  return [MGWishListComponent class];
}

@end

@interface Workaround : NSObject <RCTBridgeModule>

@end

@implementation Workaround

RCT_EXPORT_MODULE(Workaround);

RCT_EXPORT_METHOD(registerList)
{
    [[RCTComponentViewFactory currentComponentViewFactory] registerComponentViewClass: [MGWishListComponent class]];
}

-(void)setBridge:(RCTBridge *)bridge
{
    // TODO here you can intercept uiManager by registering fake surface
  //bridge.surfacePresentsr
};

@end
