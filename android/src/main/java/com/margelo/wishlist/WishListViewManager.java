package com.margelo.wishlist;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.uimanager.LayoutShadowNode;
import com.facebook.react.uimanager.ReactStylesDiffMap;
import com.facebook.react.uimanager.StateWrapper;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.ViewManagerDelegate;
import com.facebook.react.uimanager.annotations.ReactProp;

import java.util.EnumSet;

public class WishlistViewManager extends ViewGroupManager<Wishlist> implements WishlistManagerInterface<Wishlist> {
  private final ViewManagerDelegate<Wishlist> mDelegate;

  public WishlistViewManager() {
    super();

    mDelegate = new WishlistManagerDelegate<Wishlist, WishlistViewManager>(this);
  }

  @Nullable
  @Override
  protected ViewManagerDelegate<Wishlist> getDelegate() {
    return mDelegate;
  }

  @Override
  @NonNull
  public String getName() {
    return "Wishlist";
  }

  @Override
  @NonNull
  public Wishlist createViewInstance(@NonNull ThemedReactContext context) {
    return new Wishlist(context);
  }

  @Nullable
  @Override
  public Object updateState(@NonNull Wishlist view, ReactStylesDiffMap props, @Nullable StateWrapper stateWrapper) {
    view.getFabricViewStateManager().setStateWrapper(stateWrapper);
    return null;
  }

  @Override
  public void scrollTo(Wishlist view, int y, boolean animated) {

  }
}