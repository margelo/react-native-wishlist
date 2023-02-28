#import <React/RCTDefines.h>

NS_ASSUME_NONNULL_BEGIN

RCT_EXTERN dispatch_queue_t MGGetWishlistQueue(void);

RCT_EXTERN BOOL MGIsWishlistQueue(void);

RCT_EXTERN void MGExecuteOnWishlistQueue(dispatch_block_t block);

NS_ASSUME_NONNULL_END
