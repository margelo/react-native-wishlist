package com.wishlist

import android.content.Context
import android.view.View
import android.view.ViewGroup
import com.facebook.react.views.view.ReactViewGroup

class TemplateInterceptor(reactContext: Context) :
    ReactViewGroup(reactContext), ViewGroup.OnHierarchyChangeListener {
  private var wishlist: Wishlist? = null

  init {
    setOnHierarchyChangeListener(this)
  }

  override fun onChildViewAdded(parent: View, child: View) {
    if (child is Wishlist) {
      wishlist = child
    } else if (child is TemplateContainer && wishlist != null) {
      child.wishlist = wishlist
    }
  }

  override fun onChildViewRemoved(parent: View, child: View) {
    if (child is Wishlist) {
      wishlist = null
    }
  }
}
