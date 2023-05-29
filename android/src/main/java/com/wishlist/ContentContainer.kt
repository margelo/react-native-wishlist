package com.wishlist

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.viewmanagers.MGContentContainerManagerDelegate
import com.facebook.react.viewmanagers.MGContentContainerManagerInterface
import com.facebook.react.views.view.ReactViewGroup

@ReactModule(name = ContentContainerViewManager.REACT_CLASS)
class ContentContainerViewManager :
    ViewGroupManager<ReactViewGroup>(), MGContentContainerManagerInterface<ReactViewGroup> {
  companion object {
    const val REACT_CLASS = "MGContentContainer"
  }

  override fun getName() = REACT_CLASS

  override fun createViewInstance(reactContext: ThemedReactContext) = ReactViewGroup(reactContext)

  override fun getDelegate() = MGContentContainerManagerDelegate(this)
}
