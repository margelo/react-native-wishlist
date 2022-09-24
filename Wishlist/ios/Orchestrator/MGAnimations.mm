//
//  MGAnimations.m
//  MGWishList
//
//  Created by Szymon on 23/09/2022.
//

#import "MGAnimations.h"

using namespace facebook::react;

@implementation MGDecayAnimation {
    double _lastTimestamp;
    double _initialTimestamp;
    double _intialVelocity;
    BOOL _isFinished;
    double _destination;
    double _totalDistanceTraveled;
    double _decRate;
    BOOL _isInitialized;
}

- (instancetype)initWithVelocity:(double)v
{
    if (self = [super init]) {
        _intialVelocity = v;
        _totalDistanceTraveled = 0;
        _decRate = 0.998;
        _isFinished = NO;
        _isInitialized = NO;
        [self computeDestination];
    }
    return self;
}

- (void)computeDestination
{
    double d = 1000.0 * log(_decRate);
    _destination = - (_intialVelocity / d);
    NSLog(@"aaa dest %f", _destination);
}

- (CGFloat)getValueAtTimestamp:(double)timestamp {
    double d = 1000.0 * log(_decRate);
    return (pow(_decRate, 1000.0 * (timestamp - _initialTimestamp)) - 1.0) / d * _intialVelocity;
}

- (CGFloat)getDiffWithTimestamp:(double)timestamp {
    double nextVal = [self getValueAtTimestamp:timestamp];
    double diff = nextVal - _totalDistanceTraveled;
    NSLog(@"aaa diff %f", diff);
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

- (BOOL)needsSetup {
    return !_isInitialized;
}

- (void)setupWithTimestamp:(double)timestamp {
    _isInitialized = YES;
    _initialTimestamp = timestamp;
    _lastTimestamp = timestamp;
}

@end

const float notFound = -12345;
const float maxVelocity = 2000; // TODO (it should be adjusted)
const float stiffness = 1;
const float mass = 3.5;
const float damping = 5;

@implementation MGScrollToItemAnimation {
    std::shared_ptr<ViewportObserver> _viewportObserver;
    
    BOOL _needsSetup;
    BOOL _isFinished;
    CGFloat _lastOffset;
    CGFloat _targetOffset;
    int _targetIndex;
    double _lastTimestamp;
    double _velocity;
    double _velCoef;
}

- (instancetype)initWithIndex:(int)index offset:(CGFloat)offset viewportObserver:(std::shared_ptr<ViewportObserver>)viewportObserver {
    if (self = [super init]) {
        _viewportObserver = viewportObserver;
        _lastOffset = offset;
        _targetIndex = index;
        _targetOffset = notFound;
        _velocity = 0;
        
        _velCoef = 1;
        
        _isFinished = NO;
        _needsSetup = YES;
        
    }
    return self;
}

- (void)tryToFindTargetOffset {
    for (auto & item : _viewportObserver->window) {
        if (item.index == _targetIndex) {
            _targetOffset = item.offset;
            return;
        }
    }
    _targetOffset = notFound;
}

// TODO Should be clamped on ends
// TODO It won't work if we will change sizes of items during scrollTo.
// inspired by https://blog.maximeheckel.com/posts/the-physics-behind-spring-animations/
- (CGFloat)getDiffWithTimestamp:(double)timestamp {
    timestamp *= 1000.0;
    [self tryToFindTargetOffset];
    
    CGFloat timeDiff = fmax((timestamp - _lastTimestamp), 16 * 3);
    
    if (_targetOffset != notFound) {
        CGFloat k = -stiffness;
        CGFloat d = -damping;
        
        CGFloat FSpring = k * (_targetOffset - _lastOffset) / 1000.0;
        CGFloat FDamping = d * _velocity;
        
        CGFloat a = (FSpring + FDamping) / mass;
        _velocity += a * timeDiff / 1000.0;
        NSLog(@"bababa dodaje %f", a * timeDiff);
        NSLog(@"bababa distance %f", _targetOffset - _lastOffset);
        _velocity = fmin(abs(_velocity), abs(maxVelocity)) * ((_velocity < 0) ? -1.0 : 1.0);
    } else {
        if (_viewportObserver->window[0].index > _targetIndex) {
            _velCoef = -1;
        } else {
            _velCoef = 1;
        }
        _velocity = _velCoef * maxVelocity;
    }
    
    
    CGFloat diff = _velocity * timeDiff / 1000.0;
    _lastOffset += diff;
    _lastTimestamp = timestamp;
    
    if (diff < 0.01) {
        _isFinished = YES;
    }
   
    NSLog(@"babab scrollTo diff %f", diff);
    
    return -diff;
}

- (BOOL)isFinished {
    return _isFinished;
}

- (BOOL)needsSetup {
    return _needsSetup;
}

- (void)setupWithTimestamp:(double)timestamp {
    timestamp *= 1000.0;
    _needsSetup = false;
    _lastTimestamp = timestamp - 16;
}

@end


