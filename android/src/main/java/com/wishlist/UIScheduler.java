package com.wishlist;

import com.facebook.proguard.annotations.DoNotStrip;
import com.facebook.react.bridge.UiThreadUtil;

@DoNotStrip
public class UIScheduler {
  @DoNotStrip
  public static void scheduleOnUI(Runnable runnable) {
    UiThreadUtil.runOnUiThread(runnable);
  }
}
