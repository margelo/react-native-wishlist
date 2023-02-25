package com.wishlist

import android.content.Context
import android.widget.ScrollView

class Wishlist(reactContext: Context) : ScrollView(reactContext) {
  var inflatorId: String? = null
  var initialIndex: Int = 0

  fun scrollToItem(index: Int, animated: Boolean) {}
}
