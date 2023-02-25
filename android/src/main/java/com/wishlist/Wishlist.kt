package com.wishlist

import android.content.Context
import android.widget.ScrollView

class Wishlist(reactContext: Context) : ScrollView(reactContext) {
  var inflatorId: String? = null
  var wishlistId: String? = null
  var initialIndex: Int = 0
  private var alreadyRendered = false
  private var orchestrator: Orchestrator? = null

  fun setTemplates(templatesRef: Int, names: List<String>) {
    if (!alreadyRendered && names.isNotEmpty()) {
      val orchestrator = Orchestrator(this,  inflatorId!!, wishlistId!!)
      orchestrator.runWithTemplates(templatesRef, names, initialIndex)
      this.orchestrator = orchestrator
    } else {
      orchestrator?.notifyAboutNewTemplates(templatesRef, names)
    }
  }

  fun scrollToItem(index: Int, animated: Boolean) {}
}
