#import <Foundation/Foundation.h>
#import <React-RCTFabric/React/RCTScrollViewComponentView.h>
#import <React-RCTFabric/React/RCTViewComponentView.h>
#include <react/renderer/components/wishlist/RCTComponentViewHelpers.h>

NS_ASSUME_NONNULL_BEGIN

@interface MGWishListComponent : RCTScrollViewComponentView <RCTMGWishlistViewProtocol>

- (void)setTemplates:(std::vector<std::shared_ptr<facebook::react::ShadowNode const>>)templates
           withNames:(std::vector<std::string>)names;
- (void)setInflatorId:(std::string)inflatorId;
- (void)setWishlistId:(std::string)wishlistId;

- (void)handlePan:(UIPanGestureRecognizer *)gesture;

@end

NS_ASSUME_NONNULL_END
