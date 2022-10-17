#ifndef GlobalState_hpp
#define GlobalState_hpp

#include <react/renderer/uimanager/primitives.h>
#include <stdio.h>
#include <memory>
// #include <android/log.h>
#define APPNAME "Wishlist"

using namespace facebook::react;

struct GlobalState {
  static void printAnythingMethod(int tag);
};

#endif /* GlobalState_hpp */
