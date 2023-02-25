package com.wishlist

import android.content.Context
import com.facebook.react.views.view.ReactViewGroup

class TemplateContainer(reactContext: Context) : ReactViewGroup(reactContext) {
  var inflatorId: String? = null
  var wishlistId: String? = null
  var names: List<String>? = null
  var wishlist: Wishlist? = null
}
