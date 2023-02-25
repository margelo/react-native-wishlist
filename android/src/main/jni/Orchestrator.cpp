#include "Orchestrator.hpp"

#include <fbjni/fbjni.h>
#include "MGUIManagerHolder.h"
#include "WishlistJsRuntime.h"

using namespace facebook;

namespace Wishlist {

jni::local_ref<Orchestrator::jhybriddata> Orchestrator::initHybrid(
    jni::alias_ref<jclass>) {
  return makeCxxInstance();
}

Orchestrator::Orchestrator() {}

void Orchestrator::initialRenderAsync(
    float width,
    float height,
    float initialOffset,
    int originItem,
    int templatesRef,
    jni::alias_ref<jni::JList<jni::JString>> names,
    std::string inflatorId) {
    // auto templates = *reinterpret_cast<std::vector<std::shared_ptr<ShadowNode const>> *>(templatesRef);
}

void Orchestrator::registerNatives() {
  registerHybrid(
      {makeNativeMethod("initHybrid", Orchestrator::initHybrid),
       makeNativeMethod("initialRenderAsync", Orchestrator::initialRenderAsync)});
}

} // namespace Wishlist
