/**
* Copyright (c) Facebook, Inc. and its affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
* @generated by codegen project: GenerateComponentHObjCpp.js
*/

#import <Foundation/Foundation.h>
#import <React/RCTDefines.h>
#import <React/RCTLog.h>

NS_ASSUME_NONNULL_BEGIN

@protocol RCTMGWishListComponentViewProtocol <NSObject>
- (void)scrollTo:(NSInteger)y animated:(BOOL)animated;
@end

RCT_EXTERN inline void RCTMGWishListComponentHandleCommand(
  id<RCTMGWishListComponentViewProtocol> componentView,
  NSString const *commandName,
  NSArray const *args)
{
  if ([commandName isEqualToString:@"scrollTo"]) {
#if RCT_DEBUG
  if ([args count] != 2) {
    RCTLogError(@"%@ command %@ received %d arguments, expected %d.", @"MGWishListComponent", commandName, (int)[args count], 2);
    return;
  }
#endif

  NSObject *arg0 = args[0];
#if RCT_DEBUG
  if (!RCTValidateTypeOfViewCommandArgument(arg0, [NSNumber class], @"number", @"MGWishListComponent", commandName, @"1st")) {
    return;
  }
#endif
  NSInteger y = [(NSNumber *)arg0 intValue];

NSObject *arg1 = args[1];
#if RCT_DEBUG
  if (!RCTValidateTypeOfViewCommandArgument(arg1, [NSNumber class], @"boolean", @"MGWishListComponent", commandName, @"2nd")) {
    return;
  }
#endif
  BOOL animated = [(NSNumber *)arg1 boolValue];

  [componentView scrollTo:y animated:animated];
  return;
}

#if RCT_DEBUG
  RCTLogError(@"%@ received command %@, which is not a supported command.", @"MGWishListComponent", commandName);
#endif
}

NS_ASSUME_NONNULL_END