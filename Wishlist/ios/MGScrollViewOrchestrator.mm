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
     /* _currentAnimation = nil */
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
                /* _currentAnimation = [MGDecayAnimation ]*/
            }
        }
           
        [_touchEvents removeAllObjects];
    }
    // Run Animations
    /* if (_currentAnimation != nil) [_currentAnimation timeFrame: ...]*/
    
    // Update content Offset
    if (yDiff != 0) {
        CGPoint oldOffset = _scrollView.contentOffset;
        _scrollView.contentOffset = CGPointMake(oldOffset.x, oldOffset.y + yDiff);
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
    }
    
    // topElementY > topViewPortEdge (top overscroll)
    if (topElementY > topViewportEdge) {
        CGFloat diff = topElementY - topViewportEdge;
        CGPoint oldOffset = _scrollView.contentOffset;
        
        _scrollView.contentOffset = CGPointMake(oldOffset.x, oldOffset.y + diff);
        bottomViewPortEdge += diff;
        topViewportEdge += diff;
    }
    
    // pause Vsync listener if there is nothing to do
    if ([_touchEvents count] == 0 /*&& _currentAnimation == nil */ && !_doWeHavePendingTemplates) {
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
