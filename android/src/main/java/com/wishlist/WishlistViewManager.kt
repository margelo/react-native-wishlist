package com.wishlist

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

  override fun getName() = REACT_CLASS

  override fun createViewInstance(reactContext: ThemedReactContext) = Wishlist(reactContext)

  override fun getDelegate() = MGWishlistManagerDelegate(this)

  override fun updateState(
      view: Wishlist,
      props: ReactStylesDiffMap?,
      stateWrapper: StateWrapper?
  ): Any? {
    view.fabricViewStateManager.setStateWrapper(stateWrapper)
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
}
