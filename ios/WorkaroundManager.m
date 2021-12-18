//
//  WorkaroundManager.m
//  MGWishList
//
//  Created by Szymon on 11/11/2021.
//

#import "WorkaroundManager.h"

@implementation MGWishListComponentManager

RCT_EXPORT_MODULE(MGWishListComponentManager)

RCT_CUSTOM_VIEW_PROPERTY(names, NSArray<NSString*>* , UIView)
{
 // [view setRegion:json ? [RCTConvert MKCoordinateRegion:json] : defaultView.region animated:YES];
}

RCT_CUSTOM_VIEW_PROPERTY(inflatorId, NSString* , UIView)
{
 // [view setRegion:json ? [RCTConvert MKCoordinateRegion:json] : defaultView.region animated:YES];
}

RCT_CUSTOM_VIEW_PROPERTY(kkk, NSNumber* , UIView)
{
 // [view setRegion:json ? [RCTConvert MKCoordinateRegion:json] : defaultView.region animated:YES];
}

- (UIView *)view
{
  return [[UIView alloc] init];
}

@end
