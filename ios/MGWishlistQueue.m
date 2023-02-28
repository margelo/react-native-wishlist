#import "MGWishlistQueue.h"

dispatch_queue_t MGGetWishlistQueue()
{
  static dispatch_queue_t wishlistQueue;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    dispatch_queue_attr_t qos =
        dispatch_queue_attr_make_with_qos_class(DISPATCH_QUEUE_SERIAL, QOS_CLASS_USER_INITIATED, -1);
    wishlistQueue = dispatch_queue_create("wishlistqueue", qos);
  });
  return wishlistQueue;
}

BOOL MGIsWishlistQueue()
{
  static void *wishlistQueueKey = &wishlistQueueKey;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    dispatch_queue_set_specific(MGGetWishlistQueue(), wishlistQueueKey, wishlistQueueKey, NULL);
  });
  return dispatch_get_specific(wishlistQueueKey) == wishlistQueueKey;
}

void MGExecuteOnWishlistQueue(dispatch_block_t block)
{
  if (MGIsWishlistQueue()) {
    block();
  } else {
    dispatch_async(MGGetWishlistQueue(), ^{
      block();
    });
  }
}
