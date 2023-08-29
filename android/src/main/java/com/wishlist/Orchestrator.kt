package com.wishlist

import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.uimanager.PixelUtil

class Orchestrator(private val mWishlist: Wishlist, wishlistId: String, viewportCarerRef: Int) {
  companion object {
    init {
      WishlistSoLoader.staticInit()
    }
  }

  @field:DoNotStrip private val mHybridData = initHybrid(wishlistId, viewportCarerRef)

  private external fun initHybrid(wishlistId: String, viewportCarerRef: Int): HybridData

  external fun renderAsync(
      width: Float,
      height: Float,
      initialContentSize: Float,
      originItem: Int,
      templatesRef: Int,
      names: List<String>,
      inflatorId: String
  )

  external fun didScrollAsync(width: Float, height: Float, contentOffset: Float, inflatorId: String)

  external fun scrollToItem(index: Int)

  external fun didUpdateContentOffset()

  @DoNotStrip
  private fun scrollToOffset(offset: Float, animated: Boolean) {
    mWishlist.reactSmoothScrollTo(0, PixelUtil.toPixelFromDIP(offset).toInt())
  }
}
