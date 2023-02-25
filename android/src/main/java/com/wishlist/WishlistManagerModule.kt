package com.wishlist

import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.fabric.FabricUIManager
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.turbomodule.core.CallInvokerHolderImpl
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.common.UIManagerType
import com.facebook.soloader.SoLoader

@ReactModule(name = WishlistManagerModule.NAME)
class WishlistManagerModule(reactContext: ReactApplicationContext) :
    NativeWishlistManagerSpec(reactContext) {
  companion object {
    const val NAME = "WishlistManager"

    init {
      WishlistSoLoader.staticInit()
    }
  }

  @field:DoNotStrip private val mHybridData = initHybrid()

  override fun getName() = NAME

  override fun install(): Boolean {
    nativeInstall(
        reactApplicationContext.javaScriptContextHolder.get(),
        reactApplicationContext.catalystInstance.jsCallInvokerHolder as CallInvokerHolderImpl,
        UIManagerHelper.getUIManager(reactApplicationContext, UIManagerType.FABRIC)
            as FabricUIManager)
    return true
  }

  private external fun initHybrid(): HybridData

  private external fun nativeInstall(
      jsiRuntimeRef: Long,
      jsCallInvokerHolder: CallInvokerHolderImpl,
      fabricUIManager: FabricUIManager
  )
}
