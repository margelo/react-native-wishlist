#import "MGAnimationSight.hpp"

#import <Foundation/Foundation.h>
#import <memory>

NS_ASSUME_NONNULL_BEGIN

using namespace Wishlist;

@protocol MGScrollAnimation <NSObject>

- (void)setupWithTimestamp:(double)timestamp;
- (CGFloat)getDiffWithTimestamp:(double)timestamp;
- (BOOL)isFinished;
- (BOOL)needsSetup;

@end

// https://medium.com/@esskeetit/scrolling-mechanics-of-uiscrollview-142adee1142c
// most likly it can be optimised by estimating that function on [lastTimestamp, timestamp] interval
@interface MGDecayAnimation : NSObject <MGScrollAnimation>
- (instancetype)initWithVelocity:(double)v;
@end

@interface MGScrollToItemAnimation : NSObject <MGScrollAnimation>
- (instancetype)initWithIndex:(int)index
                       offset:(CGFloat)offset
                    itemSight:(std::weak_ptr<MGAnimationSight>)animationSight;
@end

NS_ASSUME_NONNULL_END
