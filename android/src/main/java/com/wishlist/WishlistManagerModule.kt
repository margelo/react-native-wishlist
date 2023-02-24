package com.wishlist

import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.turbomodule.core.CallInvokerHolderImpl
import com.facebook.soloader.SoLoader

@ReactModule(name = WishlistManagerModule.NAME)
class WishlistManagerModule(reactContext: ReactApplicationContext) :
    NativeWishlistManagerSpec(reactContext) {
  companion object {
    const val NAME = "WishlistManager"

    init {
      SoLoader.loadLibrary("react_codegen_wishlist")
    }
  }

  @field:DoNotStrip private val mHybridData = initHybrid()

  override fun getName() = NAME

  override fun install(): Boolean {
    nativeInstall(
        reactApplicationContext.javaScriptContextHolder.get(),
        reactApplicationContext.catalystInstance.jsCallInvokerHolder as CallInvokerHolderImpl)
    return true
  }

  private external fun initHybrid(): HybridData

  private external fun nativeInstall(
      jsiRuntimeRef: Long,
      jsCallInvokerHolder: CallInvokerHolderImpl
  )
}
