package com.margelo.wishlist;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.ContextWrapper;
import android.util.Log;
import android.view.View;
import android.view.ViewParent;
import android.view.ViewTreeObserver;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.uimanager.FabricViewStateManager;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.views.scroll.ReactScrollView;
import com.facebook.react.views.view.ReactViewGroup;

import java.util.EnumSet;
import java.util.concurrent.atomic.AtomicBoolean;

import androidx.annotation.Nullable;

@SuppressLint("ViewConstructor")
public class Wishlist extends ReactScrollView implements FabricViewStateManager.HasFabricViewStateManager {
  private final FabricViewStateManager mFabricViewStateManager = new FabricViewStateManager();

  public Wishlist(Context context) {
    super(context);
  }

  @Override
  public FabricViewStateManager getFabricViewStateManager() {
    return mFabricViewStateManager;
  }

  /**
   * UIManagerHelper.getReactContext only exists in RN 0.63+ so vendor it here for a while.
   */
  private static ReactContext getReactContext(View view) {
    Context context = view.getContext();
    if (!(context instanceof ReactContext) && context instanceof ContextWrapper) {
      context = ((ContextWrapper) context).getBaseContext();
    }
    return (ReactContext) context;
  }

 
  private static final long MAX_WAIT_TIME_NANO = 500000000L; // 500ms
}