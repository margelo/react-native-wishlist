#import <Foundation/Foundation.h>
#import <React-RCTFabric/React/RCTViewComponentView.h>
#import <React-RCTFabric/React/RCTScrollViewComponentView.h>

NS_ASSUME_NONNULL_BEGIN

@interface MGWishListComponent : RCTScrollViewComponentView

-(void)setTemplates:(std::vector<std::shared_ptr<facebook::react::ShadowNode const>>)templates withNames:(std::vector<std::string>)names;

@end

NS_ASSUME_NONNULL_END
