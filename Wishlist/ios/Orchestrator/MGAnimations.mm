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
    return _isInitialized;
}

- (void)setupWithTimestamp:(double)timestamp {
    _isInitialized = YES;
    _initialTimestamp = timestamp;
    _lastTimestamp = timestamp;
}

@end

const float notFound = -12345;
const float maxVelocity = 50; // TODO (it should be adjusted)

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
            break;
        }
    }
}

- (CGFloat)getDiffWithTimestamp:(double)timestamp {
    CGFloat diff = 0;
    [self tryToFindTargetOffset];
    
    if (_easingAnimation) {
        return [_easingAnimation getDiffWithTimestamp:timestamp];
    }
    
    
    
    _lastTimestamp = timestamp;
    return diff;
}

- (BOOL)isFinished {
    if (_easingAnimation) {
        return [_easingAnimation isFinished];
    }
    return _isFinished;
}

- (BOOL)needsSetup {
    return _needsSetup;
}

- (void)setupWithTimestamp:(double)timestamp {
    _needsSetup = false;
    _lastTimestamp = timestamp;
    [self tryToFindTargetOffset];
    
    if (_targetOffset != notFound) {
        // (TODO)
    } else {
        if (_viewportObserver->window[0].index > _targetIndex) {
            _velCoef *= -1;
        }
    }
}

@end


