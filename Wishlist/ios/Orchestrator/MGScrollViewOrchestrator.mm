//
//  MGScrollViewOrchestrator.m
//  MGWishList
//
//  Created by Szymon on 15/09/2022.
//

#import "MGScrollViewOrchestrator.h"

@implementation MGScrollViewOrchestrator {
    UIScrollView * _scrollView;
    CADisplayLink * _displayLink;
    
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
  inflatorId:(std::string)inflatorId initialIndex:(int)initialIndex
{
    if (self = [super init]) {
        _scrollView = scrollView;
        
        _displayLink = [CADisplayLink displayLinkWithTarget:self selector:@selector(handleVSync:)];
        [_displayLink addToRunLoop:NSRunLoop.currentRunLoop forMode:NSDefaultRunLoopMode];
        [_displayLink setPaused:YES];
        
        _viewportObserver = vo;
        
        _scrollView.contentOffset = CGPointMake(0, 500000);
        _viewportObserver->boot( //TODO Mostlikly needs to adujst offset?
                              500000,
                              _scrollView.frame.size.height, _scrollView.frame.size.width, 500000, initialIndex, templates, names, inflatorId);
        
    
        _doWeHavePendingTemplates = NO;
        _doWeHaveOngoingEvent = NO;
        _inflatorId = inflatorId;
        _touchEvents = [NSMutableArray new];
    }
    return self;
}

- (void)maybeRegisterForNextVSync
{
    if ([_displayLink isPaused]) {
        [_displayLink setPaused:NO];
    }
}

- (void)handleVSync:(CADisplayLink *)displayLink
{
    CGFloat yDiff = 0;
    // Check Touch Events
    if (_touchEvents.count > 0) {
        NSLog(@"aaa stop Animation gesture");
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
                _currentAnimation = [[MGDecayAnimation alloc] initWithVelocity:event.velocity];
            }
        }
           
        [_touchEvents removeAllObjects];
    }
    // Run Animations
    if (_currentAnimation != nil) {
        if ([_currentAnimation needsSetup]) {
            [_currentAnimation setupWithTimestamp:displayLink.timestamp];
            NSLog(@"aaa start Animation");
        }
        yDiff += [_currentAnimation getDiffWithTimestamp:displayLink.timestamp];
        if ([_currentAnimation isFinished]) {
            NSLog(@"aaa stop Animation isFinished");
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
    
    NSLog(@"aaa topElementY %f", topElementY);
    NSLog(@"aaa bottomElementY %f", bottomElementY);

    NSLog(@"aaa topViewportEdge %f", topViewportEdge);
    NSLog(@"aaa bottomViewPortEdge %f", bottomViewPortEdge);

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
        
        NSLog(@"aaa stop bottom overscroll");
        _currentAnimation = nil;
        if (_delegate) {
            [_delegate onEndReached];
        }
    }
    
    // topElementY > topViewPortEdge (top overscroll)
    if (topElementY > topViewportEdge) {
        CGFloat diff = topElementY - topViewportEdge;
        CGPoint oldOffset = _scrollView.contentOffset;
        
        _scrollView.contentOffset = CGPointMake(oldOffset.x, oldOffset.y + diff);
        bottomViewPortEdge += diff;
        topViewportEdge += diff;
        NSLog(@"aaa stop top overscroll");
        _currentAnimation = nil;
        
        if (_delegate) {
            [_delegate onStartReached];
        }
    }
    
    // pause Vsync listener if there is nothing to do
    if ([_touchEvents count] == 0 && _currentAnimation == nil && !_doWeHavePendingTemplates) {
        [_displayLink setPaused:YES];
    }
}

- (void)notifyAboutEvent:(PanEvent *)event
{
    [_touchEvents addObject:event];
    [self maybeRegisterForNextVSync];
}

- (void)notifyAboutNewTemplates:(std::vector<std::shared_ptr<facebook::react::ShadowNode const>>)templates withNames:(std::vector<std::string>)names inflatorId:(std::string)inflatorId
{
    _inflatorId = inflatorId;
    _pendingTemplates = templates;
    _pendingNames = names;
    _doWeHavePendingTemplates = YES;
    [self maybeRegisterForNextVSync];
}

- (void)scrollToItem:(int)index
{
    if (_doWeHaveOngoingEvent) {
        return;
    }
    _currentAnimation = [[MGScrollToItemAnimation alloc] initWithIndex:index offset:_scrollView.contentOffset.y viewportObserver:_viewportObserver];

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
