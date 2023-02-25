package com.wishlist

import android.content.Context
import com.facebook.react.uimanager.FabricViewStateManager
import com.facebook.react.uimanager.FabricViewStateManager.HasFabricViewStateManager
import com.facebook.react.views.view.ReactViewGroup

class TemplateContainer(reactContext: Context) :
    ReactViewGroup(reactContext), HasFabricViewStateManager {
  var inflatorId: String? = null
  var wishlistId: String? = null
  var names: List<String>? = null
  var wishlist: Wishlist? = null
    set(value) {
      field = value
      updateWishlist()
    }
  private val fabricViewStateManager: FabricViewStateManager = FabricViewStateManager()

  override fun getFabricViewStateManager() = fabricViewStateManager

  fun updateWishlist() {
    wishlist?.let {
      it.wishlistId = wishlistId
      it.inflatorId = inflatorId
      val templatesRef = fabricViewStateManager.stateData?.getInt("templates")
      if (templatesRef != null) {
        it.setTemplates(templatesRef, names ?: listOf())
      }
    }
  }
}
