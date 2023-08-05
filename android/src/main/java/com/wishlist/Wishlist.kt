package com.wishlist

import android.content.Context
import android.view.View
import com.facebook.react.uimanager.FabricViewStateManager
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.views.scroll.ReactScrollView

class Wishlist(reactContext: Context) :
    ReactScrollView(reactContext), FabricViewStateManager.HasFabricViewStateManager {
  var inflatorId: String? = null
  var wishlistId: String? = null
  var initialIndex: Int = 0
  private var orchestrator: Orchestrator? = null
  private var templatesRef: Int? = null
  private var names: List<String>? = null
  private var didInitialScroll = false
  private val initialOffset = 100000f
  private var pendingScrollOffset = -1
  private var ignoreScrollEvents = false

  fun setTemplates(templatesRef: Int, names: List<String>) {
    this.templatesRef = templatesRef
    this.names = names
    renderIfReady()
  }

  private fun renderIfReady() {
    val templatesRef = this.templatesRef
    val inflatorId = this.inflatorId
    val names = this.names
    if (names == null || templatesRef == null || inflatorId == null || width == 0 || height == 0) {
      return
    }

    var orchestrator = this.orchestrator
    if (orchestrator == null) {
      orchestrator =
          Orchestrator(
              this, wishlistId!!, fabricViewStateManager.stateData!!.getInt("viewportCarer"))
      this.orchestrator = orchestrator
    }

    orchestrator.renderAsync(
        PixelUtil.toDIPFromPixel(width.toFloat()),
        PixelUtil.toDIPFromPixel(height.toFloat()),
        initialOffset,
        initialIndex,
        templatesRef,
        names,
        inflatorId)
  }

  private fun initialScrollIfReady() {
    if (didInitialScroll) {
      return
    }
    val contentView = getChildAt(0)
    if (contentView == null || contentView.height == 0) {
      return
    }
    scrollTo(0, PixelUtil.toPixelFromDIP(initialOffset).toInt())
    didInitialScroll = true
  }

  override fun onLayoutChange(
      v: View?,
      left: Int,
      top: Int,
      right: Int,
      bottom: Int,
      oldLeft: Int,
      oldTop: Int,
      oldRight: Int,
      oldBottom: Int
  ) {
    super.onLayoutChange(v, left, top, right, bottom, oldLeft, oldTop, oldRight, oldBottom)
    initialScrollIfReady()
    maybeScrollToOffsetForContentChange()
  }

  override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
    super.onLayout(changed, l, t, r, b)

    renderIfReady()
    initialScrollIfReady()
    maybeScrollToOffsetForContentChange()
  }

  override fun onScrollChanged(x: Int, y: Int, oldX: Int, oldY: Int) {
    super.onScrollChanged(x, y, oldX, oldY)

    if (ignoreScrollEvents) {
      return
    }

    orchestrator?.didScrollAsync(
        PixelUtil.toDIPFromPixel(width.toFloat()),
        PixelUtil.toDIPFromPixel(height.toFloat()),
        PixelUtil.toDIPFromPixel(y.toFloat()),
        inflatorId!!)
  }

  fun scrollToItem(index: Int, animated: Boolean) {
    orchestrator?.scrollToItem(index)
  }

  fun scrollToOffsetForContentChange(offset: Float) {
    // State is updated before content view is laid out so update the
    // scroll position in layout handler.
    pendingScrollOffset = PixelUtil.toPixelFromDIP(offset).toInt()
  }

  private fun maybeScrollToOffsetForContentChange() {
    if (pendingScrollOffset == -1) {
      return
    }
    val contentView = getChildAt(0)
    if (contentView == null ||
        contentView.height == 0 ||
        pendingScrollOffset > contentView.height) {
      return
    }
    ignoreScrollEvents = true
    scrollTo(0, pendingScrollOffset)
    ignoreScrollEvents = false
    pendingScrollOffset = -1
  }
}
