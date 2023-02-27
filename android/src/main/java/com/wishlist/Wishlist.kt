package com.wishlist

import android.content.Context
import android.widget.ScrollView
import com.facebook.react.uimanager.FabricViewStateManager

class Wishlist(reactContext: Context) :
    ScrollView(reactContext), FabricViewStateManager.HasFabricViewStateManager {
  var inflatorId: String? = null
  var wishlistId: String? = null
  var initialIndex: Int = 0
  private var orchestrator: Orchestrator? = null
  private val fabricViewStateManager: FabricViewStateManager = FabricViewStateManager()

  override fun getFabricViewStateManager() = fabricViewStateManager

  fun setTemplates(templatesRef: Int, names: List<String>) {
    var orchestrator = this.orchestrator
    if (orchestrator == null) {
      orchestrator =
          Orchestrator(
              inflatorId!!, wishlistId!!, fabricViewStateManager.stateData!!.getInt("viewportCarer"))
    }
    orchestrator.renderAsync(
        width.toFloat(), height.toFloat(), 500000f, initialIndex, templatesRef, names, inflatorId!!)
  }

  fun scrollToItem(index: Int, animated: Boolean) {}
}
