#import <Foundation/Foundation.h>
#import <react/renderer/components/wishlist/Props.h>
#import <react/renderer/components/wishlist/ShadowNodes.h>
#import <memory>
#import <string>
#import <vector>
#import "MGDI.hpp"
#import "MGViewportCarerImpl.h"

NS_ASSUME_NONNULL_BEGIN

using namespace Wishlist;

@class MGWishListComponent;

@interface MGOrchestrator : NSObject

- (instancetype)initWith:(MGWishListComponent *)wishlist
              wishlistId:(std::string)wishlistId
           viewportCarer:(std::shared_ptr<MGViewportCarerImpl>)viewportCarer;

- (void)renderAsyncWithDimensions:(MGDims)dimensions
               initialContentSize:(CGFloat)initialContentSize
                     initialIndex:(NSInteger)initialIndex
                        templates:(std::vector<std::shared_ptr<facebook::react::ShadowNode const>>)templates
                            names:(std::vector<std::string>)names
                       inflatorId:(std::string)inflatorId;
- (void)didScrollAsyncWithDimensions:(MGDims)dimensions
                       contentOffset:(float)contentOffset
                          inflatorId:(std::string)inflatorId;
- (void)scrollToItem:(int)index;

@end

NS_ASSUME_NONNULL_END
