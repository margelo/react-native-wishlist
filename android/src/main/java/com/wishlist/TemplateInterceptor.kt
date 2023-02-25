package com.wishlist

import android.content.Context
import com.facebook.react.views.view.ReactViewGroup

class TemplateInterceptor(reactContext: Context) : ReactViewGroup(reactContext) {
  var inflatorId: String? = null
}
