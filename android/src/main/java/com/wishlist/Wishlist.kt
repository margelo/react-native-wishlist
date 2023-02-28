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

  fun setTemplates(templatesRef: Int, names: List<String>) {
    var orchestrator = this.orchestrator
    if (orchestrator == null) {
      orchestrator =
          Orchestrator(
              wishlistId!!, fabricViewStateManager.stateData!!.getInt("viewportCarer"))
      this.orchestrator = orchestrator
    }
    // TODO: width / height
    orchestrator.renderAsync(
        300f, 600f, 0f, initialIndex, templatesRef, names, inflatorId!!)
  }

  fun scrollToItem(index: Int, animated: Boolean) {}

  override fun onScrollChanged(x: Int, y: Int, oldX: Int, oldY: Int) {
    super.onScrollChanged(x, y, oldX, oldY)

    orchestrator?.didScrollAsync(300f, 600f, y.toFloat(), inflatorId!!)
  }
}
