#import <Foundation/Foundation.h>
#import <React-RCTFabric/React/RCTScrollViewComponentView.h>
#import <React-RCTFabric/React/RCTViewComponentView.h>
#import "MGScrollViewOrchestrator.h"
#import "WishlistRCTComponentViewHelpers.h"

NS_ASSUME_NONNULL_BEGIN

@interface MGWishListComponent : RCTScrollViewComponentView <MGWishlistViewProtocol, MGScrollViewOrchestratorDelegate>

- (void)setTemplates:(std::vector<std::shared_ptr<facebook::react::ShadowNode const>>)templates
           withNames:(std::vector<std::string>)names;
- (void)setInflatorId:(std::string)inflatorId;

- (void)handlePan:(UIPanGestureRecognizer *)gesture;

@end

NS_ASSUME_NONNULL_END
