package com.wishlist

import com.facebook.soloader.SoLoader

class WishlistSoLoader {
  companion object {
    @Volatile private var didInit = false

    fun staticInit() {
      if (didInit) {
        return
      }
      SoLoader.loadLibrary("react_codegen_wishlist")
      didInit = true
    }
  }
}
