//
//  MGScrollViewOrchestrator.m
//  MGWishList
//
//  Created by Szymon on 15/09/2022.
//

#import "MGScrollViewOrchestrator.h"

// https://medium.com/@esskeetit/scrolling-mechanics-of-uiscrollview-142adee1142c
// most likly it can be optimised by estimating that function on [lastTimestamp, timestamp] interval
@interface MGDecayAnimation : NSObject <MGScrollAnimation>
- (instancetype)initWithVelocity:(double)v;
@end

@implementation MGDecayAnimation {
    double _lastTimestamp;
    double _initialTimestamp;
    double _intialVelocity;
    BOOL _isFinished;
    double _destination;
    double _totalDistanceTraveled;
    double _decRate;
}

- (instancetype)initWithVelocity:(double)v
{
    if (self = [super init]) {
        _intialVelocity = v;
        _totalDistanceTraveled = 0;
        _decRate = 0.998;
        _isFinished = NO;
        [self computeDestination];
    }
    return self;
}

- (void)computeDestination
{
    double d = 1000 * log(_decRate);
    _destination = 0 - _intialVelocity / d;
}

- (CGFloat)getValueAtTimestamp:(double)timestamp {
    double d = 1000 * log(_decRate);
    return (pow(_decRate, 1000 * (timestamp - _initialTimestamp)) - 1.0) / d * _intialVelocity;
}

- (CGFloat)getDiffWithTimestamp:(double)timestamp {
    double nextVal = [self getValueAtTimestamp:timestamp];
    double diff = nextVal - _totalDistanceTraveled;
    _totalDistanceTraveled = nextVal;
    _lastTimestamp = timestamp;
    if (abs(_totalDistanceTraveled - _destination) < 0.01) {
        _isFinished = YES;
    }
    return diff;
}

- (BOOL)isFinished {
    return _isFinished;
}

- (void)setupWithTimestamp:(double)timestamp {
    _initialTimestamp = timestamp;
    _lastTimestamp = timestamp;
}

@end


@implementation MGScrollViewOrchestrator {
    UIScrollView * _scrollView;
    CADisplayLink * _displayLink;
    BOOL _paused;
    
    // Events
    NSMutableArray<PanEvent *> *_touchEvents;
    CGFloat _lastTranslation;
    BOOL _doWeHaveOngoingEvent;
    
    // PendingTemplates
    BOOL _doWeHavePendingTemplates;
    std::vector<std::shared_ptr<facebook::react::ShadowNode const>> _pendingTemplates;
    std::vector<std::string> _pendingNames;
    
    // ViewportObserer
    std::shared_ptr<ViewportObserver> _viewportObserver;
    std::string _inflatorId;
    
    id<MGScrollAnimation> _currentAnimation;
}

- (instancetype)initWith:(UIScrollView*)scrollView templates:(std::vector<std::shared_ptr<facebook::react::ShadowNode const>>)templates names:(std::vector<std::string>)names viewportObserver:(std::shared_ptr<ViewportObserver>)vo
  inflatorId:(std::string)inflatorId
{
    if (self = [super init]) {
        _scrollView = scrollView;
        
        _paused = YES;
        _displayLink = [CADisplayLink displayLinkWithTarget:self selector:@selector(handleVSync:)];
        [_displayLink addToRunLoop:NSRunLoop.currentRunLoop forMode:NSDefaultRunLoopMode];
        [_displayLink setPaused:YES];
        
        _viewportObserver = vo;
        
        _viewportObserver->boot( //TODO Mostlikly needs to adujst offset?
                              0,
                              _scrollView.frame.size.height, _scrollView.frame.size.width, 0, 0, templates, names, inflatorId);
        
    
        _doWeHavePendingTemplates = NO;
        _doWeHaveOngoingEvent = NO;
        _inflatorId = inflatorId;
        _touchEvents = [NSMutableArray new];
    }
    return self;
}

- (void)maybeRegisterForNextVSync
{
    if (_paused) {
        _paused = NO;
        [_displayLink setPaused:NO];
    }
}

- (void)handleVSync:(CADisplayLink *)displayLink
{
    CGFloat yDiff = 0;
    // Check Touch Events
    if (_touchEvents.count > 0) {
        _currentAnimation = nil;
        for (PanEvent * event in _touchEvents) {
            if (event.state == UIGestureRecognizerStateBegan) {
                _lastTranslation = 0;
                _doWeHaveOngoingEvent = YES;
            }
            if (event.state == UIGestureRecognizerStateChanged) {
                yDiff = event.translation - _lastTranslation;
                _lastTranslation = event.translation;
                
            }
            if (event.state == UIGestureRecognizerStateEnded) {
                _doWeHaveOngoingEvent = NO;
                // start Animation with velocity
                _currentAnimation = [[MGDecayAnimation alloc] initWithVelocity:event.velocity/1000];
                [_currentAnimation setupWithTimestamp:displayLink.timestamp * 1000];
            }
        }
           
        [_touchEvents removeAllObjects];
    }
    // Run Animations
    if (_currentAnimation != nil) {
        yDiff += [_currentAnimation getDiffWithTimestamp:displayLink.timestamp * 1000];
        if ([_currentAnimation isFinished]) {
            _currentAnimation = nil;
        }
    }
    
    // Update content Offset
    if (yDiff != 0) {
        CGPoint oldOffset = _scrollView.contentOffset;
        _scrollView.contentOffset = CGPointMake(oldOffset.x, oldOffset.y - yDiff);
    }
    
    // update teamplates if needed
    if (_doWeHavePendingTemplates) {
        _viewportObserver->update(_scrollView.frame.size.height, _scrollView.frame.size.width, _pendingTemplates, _pendingNames, _inflatorId);
        _doWeHavePendingTemplates = NO;
    }
    
    // cover Viewport if possible
    _viewportObserver->reactToOffsetChange(_scrollView.contentOffset.y);
    
    // update offset if new elements require it
    CGFloat topElementY = _viewportObserver->window[0].offset;
    CGFloat bottomElementY = _viewportObserver->window.back().offset;
    
    CGFloat topViewportEdge = _scrollView.contentOffset.y;
    CGFloat bottomViewPortEdge = topViewportEdge + _scrollView.frame.size.height;
    
    // ugly casework
    // topElementY < topViewportEdge (possibly new elementsOnTheTop)
        /* stop overscrollAnimation */
    
    // bottomElementY < bottomViewportEdge (bottom overscroll)
    if (bottomElementY < bottomViewPortEdge) {
        CGFloat diff = bottomElementY - bottomViewPortEdge;
        CGPoint oldOffset = _scrollView.contentOffset;
        
        _scrollView.contentOffset = CGPointMake(oldOffset.x, oldOffset.y + diff);
        bottomViewPortEdge += diff;
        topViewportEdge += diff;
        
        _currentAnimation = nil;
    }
    
    // topElementY > topViewPortEdge (top overscroll)
    if (topElementY > topViewportEdge) {
        CGFloat diff = topElementY - topViewportEdge;
        CGPoint oldOffset = _scrollView.contentOffset;
        
        _scrollView.contentOffset = CGPointMake(oldOffset.x, oldOffset.y + diff);
        bottomViewPortEdge += diff;
        topViewportEdge += diff;
        _currentAnimation = nil;
    }
    
    // pause Vsync listener if there is nothing to do
    if ([_touchEvents count] == 0 && _currentAnimation == nil && !_doWeHavePendingTemplates) {
        _paused = YES;
        [_displayLink setPaused:YES];
    }
}

- (void)notifyAboutEvent:(PanEvent *)event
{
    [_touchEvents addObject:event];
    [self maybeRegisterForNextVSync];
}

- (void)notifyAboutNewTemplates:(std::vector<std::shared_ptr<facebook::react::ShadowNode const>>)templates withNames:(std::vector<std::string>)names
{
    _pendingTemplates = templates;
    _pendingNames = names;
    _doWeHavePendingTemplates = YES;
    [self maybeRegisterForNextVSync];
}

- (void)dealloc
{
    _scrollView = nil;
    [_displayLink invalidate];
}

@end

@implementation PanEvent

@end
