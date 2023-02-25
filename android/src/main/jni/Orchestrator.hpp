#pragma once

#include <fbjni/fbjni.h>

using namespace facebook;

namespace Wishlist {

    class Orchestrator : public jni::HybridClass<Orchestrator> {
    public:
        Orchestrator();

        static constexpr auto kJavaDescriptor =
                "Lcom/wishlist/Orchestrator;";

        static void registerNatives();

    private:
        static jni::local_ref<jhybriddata> initHybrid(jni::alias_ref<jclass>);

        void initialRenderAsync(
                float width,
                float height,
                float initialOffset,
                int originItem,
                int templatesRef,
                jni::alias_ref<jni::JList<jni::JString>> names,
                std::string inflatorId);

    private:
        friend HybridBase;
    };

} // namespace Wishlist
