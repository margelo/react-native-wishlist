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
              inflatorId!!, wishlistId!!, fabricViewStateManager.stateData!!.getInt("viewportCarer"))
    }
    // TODO: width / height
    orchestrator.renderAsync(
        300f, 600f, 500000f, initialIndex, templatesRef, names, inflatorId!!)
  }

  fun scrollToItem(index: Int, animated: Boolean) {}
}
