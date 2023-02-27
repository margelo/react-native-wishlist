package com.wishlist

import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.bridge.UiThreadUtil

@DoNotStrip
class UIScheduler {
  companion object {
    @DoNotStrip
    @JvmStatic
    fun scheduleOnUI(runnable: Runnable?) {
      UiThreadUtil.runOnUiThread(runnable)
    }
  }
}
