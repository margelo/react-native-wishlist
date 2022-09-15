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
    
    NSMutableArray<PanEvent *> *_touchEvents;
    
    std::vector<std::shared_ptr<facebook::react::ShadowNode const>> _templates;
    std::vector<std::string> _names;
}

- (instancetype)initWith:(UIScrollView*)scrollView;
{
    if (self = [super init]) {
        _scrollView = scrollView;
        
        _paused = YES;
        _displayLink = [CADisplayLink displayLinkWithTarget:self selector:@selector(handleVSync:)];
        [_displayLink addToRunLoop:NSRunLoop.currentRunLoop forMode:NSDefaultRunLoopMode];
        [_displayLink setPaused:YES];
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
    // Check Touch Events
    
    // Run Animations
    
    // update teamplates if needed
    
    // update viewport
    
    // update offset if new elements require it
}

- (void)notifyAboutEvent:(PanEvent *)event
{
    [_touchEvents addObject:event];
    [self maybeRegisterForNextVSync];
}

- (void)notifyAboutNewTemplates:(std::vector<std::shared_ptr<facebook::react::ShadowNode const>>)templates withNames:(std::vector<std::string>)names
{
    _templates = templates;
    _names = names;
    [self maybeRegisterForNextVSync];
}

- (void)dealloc
{
    _scrollView = nil;
    [_displayLink invalidate];
}

@end
