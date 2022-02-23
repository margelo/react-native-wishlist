#include "WishlistComponentsRegistry.h"

#include <CoreComponentsRegistry.h>
#include <fbjni/fbjni.h>
#include <react/renderer/componentregistry/ComponentDescriptorProviderRegistry.h>
#include <react/renderer/components/safeareacontext/ComponentDescriptors.h> // TODO
#include <react/renderer/components/safeareacontext/RNCSafeAreaViewComponentDescriptor.h> // TODO

namespace facebook {
namespace react {

WishlistComponentsRegistry::WishlistComponentsRegistry(
    ComponentFactory *delegate)
    : delegate_(delegate) {}

std::shared_ptr<ComponentDescriptorProviderRegistry const>
WishlistComponentsRegistry::sharedProviderRegistry() {
  auto providerRegistry = CoreComponentsRegistry::sharedProviderRegistry();

  providerRegistry->add(concreteComponentDescriptorProvider<
                        WishlistComponentDescriptor>());

  return providerRegistry;
}

jni::local_ref<WishlistComponentsRegistry::jhybriddata>
WishlistComponentsRegistry::initHybrid(
    jni::alias_ref<jclass>,
    ComponentFactory *delegate) {
  auto instance = makeCxxInstance(delegate);

  auto buildRegistryFunction =
      [](EventDispatcher::Weak const &eventDispatcher,
         ContextContainer::Shared const &contextContainer)
      -> ComponentDescriptorRegistry::Shared {
    auto registry = WishlistComponentsRegistry::sharedProviderRegistry()
                        ->createComponentDescriptorRegistry(
                            {eventDispatcher, contextContainer});

    return registry;
  };

  delegate->buildRegistryFunction = buildRegistryFunction;
  return instance;
}

void WishlistComponentsRegistry::registerNatives() {
  registerHybrid({
      makeNativeMethod("initHybrid", WishlistComponentsRegistry::initHybrid),
  });
  // This is a temporary solution that allows components exported by the rnsac
  // library to be added to the main component registry. This code is triggered
  // when c++ screens library is initialized and is needed because RN's autolinking
  // does not currently support Fabric components. As a consequence, users would need
  // to manually put library initialization calls in their ReactNativeHost implementation
  // which is undesirable.
  sharedProviderRegistry();
}

} // namespace react
} // namespace facebook