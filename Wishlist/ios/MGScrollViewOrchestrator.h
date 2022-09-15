//
//  MGScrollViewOrchestrator.h
//  MGWishList
//
//  Created by Szymon on 15/09/2022.
//

#import <Foundation/Foundation.h>
#import <vector>
#import <string>
#import <memory>
#import "WishlistProps.h"
#import "WishlistShadowNodes.h"

NS_ASSUME_NONNULL_BEGIN

@interface PanEvent : NSObject;

@property (nonatomic, strong, readonly) UIGestureRecognizerState *state;
@property (nonatomic, assign, readonly) CGFloat translation;
@property (nonatomic, assign, readonly) CGFloat velocity;

@end

@implementation PanEvent

@end



@interface MGScrollViewOrchestrator : NSObject

- (instancetype)initWith:(UIScrollView *)scrollView;
- (void)notifyAboutEvent:(PanEvent *)event;
- (void)notifyAboutNewTemplates:(std::vector<std::shared_ptr<facebook::react::ShadowNode const>>)templates withNames:(std::vector<std::string>)names;

@end

NS_ASSUME_NONNULL_END
