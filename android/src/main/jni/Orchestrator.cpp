#include "Orchestrator.hpp"

#include <fbjni/fbjni.h>
#include "JNIStateRegistry.h"
#include "MGUIManagerHolder.h"
#include "UISchedulerAndroid.h"
#include "WishlistJsRuntime.h"

using namespace facebook;

namespace Wishlist {

jni::local_ref<Orchestrator::jhybriddata> Orchestrator::initHybrid(
    jni::alias_ref<jclass>,
    std::string inflatorId,
    std::string wishlistId,
    int viewportCarerRef) {
  return makeCxxInstance(inflatorId, wishlistId, viewportCarerRef);
}

Orchestrator::Orchestrator(
    const std::string &inflatorId,
    const std::string &wishlistId,
    int viewportCarerRef)
    : alreadyRendered_(false),
      inflatorId_(inflatorId),
      wishlistId_(wishlistId) {
  auto viewportCarer =
      *reinterpret_cast<std::shared_ptr<MGViewportCarerImpl> *>(
          JNIStateRegistry::getInstance().getValue(viewportCarerRef));
  di_ = std::make_shared<MGDIImpl>();
  di_->setViewportCarerImpl(viewportCarer);
  viewportCarer->setDI(di_);
  di_->setOrchestratorCppAdaper(std::make_shared<MGOrchestratorCppAdapter>(
      [=](float top, float bottom) {
        // TODO:
      },
      [=]() {
        // TODO:
      }));
  di_->setDataBindingImpl(
      std::make_shared<MGDataBindingImpl>(wishlistId_, di_->getWeak()));
  di_->setWindowKeeper(std::make_shared<MGWindowKeeper>(di_->getWeak()));
  di_->setUIScheduler(std::make_shared<UISchedulerAndroid>());
}

void Orchestrator::renderAsync(
    float width,
    float height,
    float initialOffset,
    int originItem,
    int templatesRef,
    jni::alias_ref<jni::JList<jni::JString>> namesList,
    std::string inflatorId) {
  auto templates =
      *reinterpret_cast<std::vector<std::shared_ptr<ShadowNode const>> *>(
          JNIStateRegistry::getInstance().getValue(templatesRef));
  if (!alreadyRendered_ && namesList->size() > 0 &&
      namesList->size() == templates.size()) {
    alreadyRendered_ = true;

    std::vector<std::string> names;
    for (const auto &name : *namesList) {
      names.push_back(name->toStdString());
    }

    di_->getViewportCarer()->initialRenderAsync(
        {width, height},
        initialOffset,
        originItem,
        templates,
        names,
        inflatorId);
  } else {
  }
}

void Orchestrator::registerNatives() {
  registerHybrid(
      {makeNativeMethod("initHybrid", Orchestrator::initHybrid),
       makeNativeMethod("renderAsync", Orchestrator::renderAsync)});
}

} // namespace Wishlist
