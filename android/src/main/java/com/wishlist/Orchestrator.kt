package com.wishlist

import android.widget.ScrollView
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip

class Orchestrator(
    private val scrollView: ScrollView,
    private val inflatorId: String,
    private val wishlistId: String
) {
  companion object {
    init {
      WishlistSoLoader.staticInit()
    }
  }

  @field:DoNotStrip private val mHybridData = initHybrid()

  fun runWithTemplates(templatesRef: Int, names: List<String>, initialIndex: Int) {
    initialRenderAsync(
        scrollView.width.toFloat(),
        scrollView.height.toFloat(),
        500000f,
        initialIndex,
        templatesRef,
        names,
        inflatorId)
  }

  fun notifyAboutNewTemplates(templatesRef: Int, names: List<String>) {}

  private external fun initHybrid(): HybridData

  external fun initialRenderAsync(
      width: Float,
      height: Float,
      initialOffset: Float,
      originItem: Int,
      templatesRef: Int,
      names: List<String>,
      inflatorId: String
  )
}
