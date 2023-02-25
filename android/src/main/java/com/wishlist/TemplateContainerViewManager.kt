package com.wishlist

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.MGTemplateContainerManagerDelegate
import com.facebook.react.viewmanagers.MGTemplateContainerManagerInterface

@ReactModule(name = TemplateContainerViewManager.REACT_CLASS)
class TemplateContainerViewManager :
    ViewGroupManager<TemplateContainer>(), MGTemplateContainerManagerInterface<TemplateContainer> {
  companion object {
    const val REACT_CLASS = "MGTemplateContainer"
  }

  override fun getName() = REACT_CLASS

  override fun createViewInstance(reactContext: ThemedReactContext) =
      TemplateContainer(reactContext)

  override fun getDelegate() = MGTemplateContainerManagerDelegate(this)

  @ReactProp(name = "inflatorId")
  override fun setInflatorId(view: TemplateContainer, value: String?) {
    view.inflatorId = value
  }

  @ReactProp(name = "wishlistId")
  override fun setWishlistId(view: TemplateContainer, value: String?) {
    view.wishlistId = value
  }

  @ReactProp(name = "names")
  override fun setNames(view: TemplateContainer, value: ReadableArray?) {
    if (value != null) {
      val names = ArrayList<String>(value.size())
      for (i in 0 until value.size()) {
        names.add(value.getString(i))
      }
      view.names = names
    } else {
      view.names = null
    }
  }
}
