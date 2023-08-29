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
    jni::alias_ref<jhybridobject> jThis,
    std::string wishlistId,
    int viewportCarerRef) {
  return makeCxxInstance(jThis, wishlistId, viewportCarerRef);
}

Orchestrator::Orchestrator(
    jni::alias_ref<Orchestrator::javaobject> jThis,
    const std::string &wishlistId,
    int viewportCarerRef)
    : javaPart_(jni::make_global(jThis)),
      alreadyRendered_(false),
      pendingScrollToItem_(-1) {
  adapter_ = std::make_shared<Adapter>(
      [this]() { handleVSync(); },
      [this](std::vector<Item> items) { didPushChildren(std::move(items)); });
  auto viewportCarer =
      *reinterpret_cast<std::shared_ptr<MGViewportCarerImpl> *>(
          JNIStateRegistry::getInstance().getValue(viewportCarerRef));
  di_ = std::make_shared<MGDIImpl>();
  di_->setViewportCarer(viewportCarer);
  viewportCarer->setDI(di_);
  viewportCarer->setListener(std::weak_ptr<Adapter>(adapter_));
  di_->setDataBinding(
      std::make_shared<MGDataBindingImpl>(wishlistId, di_->getWeak()));
  di_->setVSyncRequester(adapter_);
  di_->setUIScheduler(std::make_shared<UISchedulerAndroid>());
  di_->setErrorHandler(std::make_shared<ErrorHandlerAndroid>());
}

void Orchestrator::renderAsync(
    float width,
    float height,
    float initialContentSize,
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
    inflatorId_ = inflatorId;

    di_->getViewportCarer()->initialRenderAsync(
        {width, height},
        initialContentSize,
        originItem,
        templates,
        jListToVector(namesList),
        inflatorId);
  } else {
    width_ = width;
    height_ = height;
    inflatorId_ = inflatorId;
    handleVSync();
  }
}

void Orchestrator::didScrollAsync(
    float width,
    float height,
    float contentOffset,
    std::string inflatorId) {
  width_ = width;
  height_ = height;
  inflatorId_ = inflatorId;
  di_->getViewportCarer()->didScrollAsync(
      {width, height}, contentOffset, inflatorId);
}

void Orchestrator::handleVSync() {
  di_->getViewportCarer()->didScrollAsync(
      {width_, height_}, MG_NO_OFFSET, inflatorId_);
}

void Orchestrator::didUpdateContentOffset() {
  di_->getViewportCarer()->didUpdateContentOffset();
}

void Orchestrator::scrollToItem(int index) {
  float offset = -1;
  for (auto &item : items_) {
    if (item.index == index) {
      offset = item.offset;
      break;
    }
  }

  static const auto scrollToOffset =
      javaClassStatic()->getMethod<void(float)>("scrollToOffset");

  if (offset == -1) {
    pendingScrollToItem_ = index;
    bool isBelow = items_.back().index < index;
    // TODO: Implement proper animation for items outside the window.
    if (isBelow) {
      scrollToOffset(javaPart_, items_.back().offset + 1000);
    } else {
      scrollToOffset(javaPart_, items_.front().offset - 1000);
    }
  } else {
    pendingScrollToItem_ = -1;
    scrollToOffset(javaPart_, offset);
  }
}

void Orchestrator::didPushChildren(std::vector<Item> items) {
  items_ = std::move(items);
  if (pendingScrollToItem_ != -1) {
    scrollToItem(pendingScrollToItem_);
  }
}

Orchestrator::Adapter::Adapter(
    std::function<void()> onRequestVSync,
    std::function<void(std::vector<Item> items)> didPushChildren)
    : onRequestVSync_(onRequestVSync), didPushChildren_(didPushChildren) {}

void Orchestrator::Adapter::didPushChildren(std::vector<Item> newWindow) {
  didPushChildren_(std::move(newWindow));
}

void Orchestrator::Adapter::requestVSync() {
  onRequestVSync_();
}

void Orchestrator::registerNatives() {
  registerHybrid(
      {makeNativeMethod("initHybrid", Orchestrator::initHybrid),
       makeNativeMethod("renderAsync", Orchestrator::renderAsync),
       makeNativeMethod("didScrollAsync", Orchestrator::didScrollAsync),
       makeNativeMethod(
           "didUpdateContentOffset", Orchestrator::didUpdateContentOffset),
       makeNativeMethod("scrollToItem", Orchestrator::scrollToItem)});
}

} // namespace Wishlist
