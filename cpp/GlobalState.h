#pragma once

#include <react/renderer/uimanager/primitives.h>
#include <stdio.h>
#include <memory>
// #include <android/log.h>
#define APPNAME "Wishlist"

using namespace facebook::react;

namespace Wishlist {

struct GlobalState {
  static void printAnythingMethod(int tag);
};

}; // namespace Wishlist
