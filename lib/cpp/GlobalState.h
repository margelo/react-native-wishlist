#ifndef GlobalState_hpp
#define GlobalState_hpp

#include <stdio.h>
#include <memory>
#include <react/renderer/uimanager/primitives.h>
#include <android/log.h>
#define APPNAME "Wishlist"


using namespace facebook::react;

struct GlobalState {
  static void printAnythingMethod(int tag);
};

#endif /* GlobalState_hpp */
