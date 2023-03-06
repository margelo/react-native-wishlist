#include "Orchestrator.hpp"

#include <fbjni/fbjni.h>
#include "ErrorHandlerAndroid.h"
#include "JNIStateRegistry.h"
#include "MGDataBindingImpl.hpp"
#include "MGUIManagerHolder.h"
#include "MGViewportCarerImpl.h"
#include "UISchedulerAndroid.h"
#include "WishlistJsRuntime.h"

using namespace facebook;

namespace Wishlist {

static inline std::vector<std::string> jListToVector(
    alias_ref<jni::JList<jni::JString>> jList) {
  std::vector<std::string> res;
  for (const auto &val : *jList) {
    res.push_back(val->toStdString());
  }
  return res;
}

jni::local_ref<Orchestrator::jhybriddata> Orchestrator::initHybrid(
    jni::alias_ref<jclass>,
    std::string wishlistId,
    int viewportCarerRef) {
  return makeCxxInstance(wishlistId, viewportCarerRef);
}

Orchestrator::Orchestrator(const std::string &wishlistId, int viewportCarerRef)
    : alreadyRendered_(false) {
  adapter_ = std::make_shared<Adapter>([this]() { handleVSync(); });
  auto viewportCarer =
      *reinterpret_cast<std::shared_ptr<MGViewportCarerImpl> *>(
          JNIStateRegistry::getInstance().getValue(viewportCarerRef));
  di_ = std::make_shared<MGDIImpl>();
  di_->setViewportCarer(viewportCarer);
  viewportCarer->setDI(di_);
  di_->setDataBinding(
      std::make_shared<MGDataBindingImpl>(wishlistId, di_->getWeak()));
  di_->setPushChildrenListener(adapter_);
  di_->setVSyncRequester(adapter_);
  di_->setUIScheduler(std::make_shared<UISchedulerAndroid>());
  di_->setErrorHandler(std::make_shared<ErrorHandlerAndroid>());
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
    width_ = width;
    height_ = height;
    contentOffset_ = initialOffset;
    inflatorId_ = inflatorId;

    di_->getViewportCarer()->initialRenderAsync(
        {width, height},
        initialOffset,
        originItem,
        templates,
        jListToVector(namesList),
        inflatorId);
  } else {
    // TODO:
  }
}

void Orchestrator::didScrollAsync(
    float width,
    float height,
    float contentOffset,
    std::string inflatorId) {
  width_ = width;
  height_ = height;
  contentOffset_ = contentOffset;
  inflatorId_ = inflatorId;
  handleVSync();
}

void Orchestrator::handleVSync() {
  // TODO: These do not seem to be needed.
  auto templates =
      std::vector<std::shared_ptr<facebook::react::ShadowNode const>>();
  auto names = std::vector<std::string>();
  di_->getViewportCarer()->didScrollAsync(
      {width_, height_}, templates, names, contentOffset_, inflatorId_);
}

Orchestrator::Adapter::Adapter(std::function<void()> onRequestVSync)
    : onRequestVSync_(onRequestVSync) {}

void Orchestrator::Adapter::didPushChildren(std::vector<Item> newWindow) {}

void Orchestrator::Adapter::requestVSync() {
  onRequestVSync_();
}

void Orchestrator::registerNatives() {
  registerHybrid(
      {makeNativeMethod("initHybrid", Orchestrator::initHybrid),
       makeNativeMethod("renderAsync", Orchestrator::renderAsync),
       makeNativeMethod("didScrollAsync", Orchestrator::didScrollAsync)});
}

} // namespace Wishlist
