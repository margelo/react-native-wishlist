package com.wishlist

import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip

class Orchestrator(inflatorId: String, wishlistId: String, viewportCarerRef: Int) {
  companion object {
    init {
      WishlistSoLoader.staticInit()
    }
  }

  @field:DoNotStrip private val mHybridData = initHybrid(inflatorId, wishlistId, viewportCarerRef)

  private external fun initHybrid(
      inflatorId: String,
      wishlistId: String,
      viewportCarerRef: Int
  ): HybridData

  external fun renderAsync(
      width: Float,
      height: Float,
      initialOffset: Float,
      originItem: Int,
      templatesRef: Int,
      names: List<String>,
      inflatorId: String
  )
}
