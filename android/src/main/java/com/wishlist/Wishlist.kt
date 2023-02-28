package com.wishlist

import android.content.Context
import com.facebook.react.uimanager.FabricViewStateManager
import com.facebook.react.views.scroll.ReactScrollView

class Wishlist(reactContext: Context) :
  ReactScrollView(reactContext), FabricViewStateManager.HasFabricViewStateManager {
  var inflatorId: String? = null
  var wishlistId: String? = null
  var initialIndex: Int = 0
  private var orchestrator: Orchestrator? = null
  private var templatesRef: Int? = null
  private var names: List<String>? = null

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
          wishlistId!!, fabricViewStateManager.stateData!!.getInt("viewportCarer")
        )
      this.orchestrator = orchestrator
    }
    // TODO: width / height
    orchestrator.renderAsync(
      width.toFloat(), height.toFloat(), 0f, initialIndex, templatesRef, names, inflatorId
    )
  }

  override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
    super.onLayout(changed, l, t, r, b)

    renderIfReady()
  }

  override fun onScrollChanged(x: Int, y: Int, oldX: Int, oldY: Int) {
    super.onScrollChanged(x, y, oldX, oldY)

    orchestrator?.didScrollAsync(width.toFloat(), height.toFloat(), y.toFloat(), inflatorId!!)
  }

  fun scrollToItem(index: Int, animated: Boolean) {}
}
