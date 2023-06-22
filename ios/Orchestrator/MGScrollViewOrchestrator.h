#import <Foundation/Foundation.h>
#import <react/renderer/components/wishlist/Props.h>
#import <react/renderer/components/wishlist/ShadowNodes.h>
#import <memory>
#import <string>
#import <vector>
#import "MGAnimations.h"
#import "MGDIIOS.h"

NS_ASSUME_NONNULL_BEGIN

using namespace Wishlist;

@interface PanEvent : NSObject

@property (nonatomic, assign) UIGestureRecognizerState state;
@property (nonatomic, assign) CGFloat translation;
@property (nonatomic, assign) CGFloat velocity;

@end

@interface MGScrollViewOrchestrator : NSObject

- (instancetype)initWith:(UIScrollView *)scrollView
                      di:(std::weak_ptr<MGDIIOS>)di
              inflatorId:(std::string)inflatorId
              wishlistId:(std::string)wishlistId;

- (void)runWithTemplates:(std::vector<std::shared_ptr<facebook::react::ShadowNode const>>)templates
                   names:(std::vector<std::string>)names
            initialIndex:(int)initialIndex;

- (void)notifyAboutEvent:(PanEvent *)event;
- (void)notifyAboutNewTemplates:(std::vector<std::shared_ptr<facebook::react::ShadowNode const>>)templates
                      withNames:(std::vector<std::string>)names
                     inflatorId:(std::string)inflatorId;
- (void)scrollToItem:(int)index;
- (void)requestVSync;
- (void)edgesChangedWithTopEdge:(float)topEdge bottomEdge:(float)bottomEdge;

@end

NS_ASSUME_NONNULL_END
