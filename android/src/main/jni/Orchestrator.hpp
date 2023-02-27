#pragma once

#include <fbjni/fbjni.h>
#include "MGDIImpl.hpp"

using namespace facebook;

namespace Wishlist {

class Orchestrator : public jni::HybridClass<Orchestrator> {
 public:
  Orchestrator(
      const std::string &inflatorId,
      const std::string &wishlistId,
      int viewportCarerRef);

  static constexpr auto kJavaDescriptor = "Lcom/wishlist/Orchestrator;";

  static void registerNatives();

 private:
  static jni::local_ref<jhybriddata> initHybrid(
      jni::alias_ref<jclass>,
      std::string inflatorId,
      std::string wishlistId,
      int viewportCarerRef);

  void renderAsync(
      float width,
      float height,
      float initialOffset,
      int originItem,
      int templatesRef,
      jni::alias_ref<jni::JList<jni::JString>> names,
      std::string inflatorId);

 private:
  friend HybridBase;

  bool alreadyRendered_;
  std::shared_ptr<MGDIImpl> di_;
  std::string inflatorId_;
  std::string wishlistId_;
};

} // namespace Wishlist
