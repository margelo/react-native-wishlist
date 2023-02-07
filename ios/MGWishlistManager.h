#import <React/RCTViewManager.h>
#import <wishlist/wishlist.h>

NS_ASSUME_NONNULL_BEGIN

@interface MGWishlistManager : NSObject <NativeWishlistManagerSpec>
@end

@interface MGWishlistComponentManager : RCTViewManager
@end

@interface MGTemplateContainerManager : RCTViewManager
@end

@interface MGTemplateInterceptorManager : RCTViewManager
@end

NS_ASSUME_NONNULL_END
