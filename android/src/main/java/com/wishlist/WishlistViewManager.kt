package com.wishlist

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.common.MapBuilder
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ReactStylesDiffMap
import com.facebook.react.uimanager.StateWrapper
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.MGWishlistManagerDelegate
import com.facebook.react.viewmanagers.MGWishlistManagerInterface

@ReactModule(name = WishlistViewManager.REACT_CLASS)
class WishlistViewManager : ViewGroupManager<Wishlist>(), MGWishlistManagerInterface<Wishlist> {
  companion object {
    const val REACT_CLASS = "MGWishlist"
  }

  private val mDelegate = MGWishlistManagerDelegate(this)

  override fun getName() = REACT_CLASS

  override fun createViewInstance(reactContext: ThemedReactContext) = Wishlist(reactContext)

  override fun getDelegate() = mDelegate

  override fun updateState(
      view: Wishlist,
      props: ReactStylesDiffMap?,
      stateWrapper: StateWrapper?
  ): Any? {
    view.fabricViewStateManager.setStateWrapper(stateWrapper)
    val stateData = stateWrapper?.stateData
    if (stateData != null && stateData.hasKey("contentOffset")) {
      view.scrollToOffsetForContentChange(stateData.getDouble("contentOffset").toFloat())
    }
    return null
  }

  @ReactProp(name = "inflatorId")
  override fun setInflatorId(view: Wishlist, value: String?) {
    view.inflatorId = value
  }

  @ReactProp(name = "initialIndex")
  override fun setInitialIndex(view: Wishlist, value: Int) {
    view.initialIndex = value
  }

  override fun scrollToItem(view: Wishlist, index: Int, animated: Boolean) {
    view.scrollToItem(index, animated)
  }

  override fun receiveCommand(root: Wishlist, commandId: String?, args: ReadableArray?) {
    mDelegate.receiveCommand(root, commandId, args)
  }

  override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any>? {
    return MapBuilder.builder<String, Any>()
        .put("topStartReached", MapBuilder.of("registrationName", "onStartReached"))
        .put("topEndReached", MapBuilder.of("registrationName", "onEndReached"))
        .build()
  }
}
