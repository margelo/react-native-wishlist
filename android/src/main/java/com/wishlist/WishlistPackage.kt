package com.wishlist

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class WishlistPackage : ReactPackage {
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    UIScheduler.scheduleOnUI(Runnable {})
    return listOf(WishlistManagerModule(reactContext))
  }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return listOf(
        WishlistViewManager(), TemplateContainerViewManager(), TemplateInterceptorViewManager())
  }
}
