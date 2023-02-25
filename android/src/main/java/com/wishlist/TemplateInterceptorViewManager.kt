package com.wishlist

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.MGTemplateInterceptorManagerDelegate
import com.facebook.react.viewmanagers.MGTemplateInterceptorManagerInterface

@ReactModule(name = TemplateInterceptorViewManager.REACT_CLASS)
class TemplateInterceptorViewManager :
    ViewGroupManager<TemplateInterceptor>(),
    MGTemplateInterceptorManagerInterface<TemplateInterceptor> {
  companion object {
    const val REACT_CLASS = "MGTemplateInterceptor"
  }

  override fun getName() = REACT_CLASS

  override fun createViewInstance(reactContext: ThemedReactContext) =
      TemplateInterceptor(reactContext)

  override fun getDelegate() = MGTemplateInterceptorManagerDelegate(this)

  @ReactProp(name = "inflatorId")
  override fun setInflatorId(view: TemplateInterceptor, value: String?) {
    view.inflatorId = value
  }
}
