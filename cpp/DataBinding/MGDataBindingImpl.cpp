//
//  MGDataBindingImpl.cpp
//  MGWishList
//
//  Created by Szymon on 16/01/2023.
//

#include "MGDataBindingImpl.hpp"
#include "WishlistJsRuntime.h"

using namespace Wishlist;
using namespace facebook;

MGDataBindingImpl::MGDataBindingImpl(
    std::string wishlistId,
    std::weak_ptr<MGDI> _di)
    : _wishlistId(wishlistId), di(_di) {
  registerBindings();
}

std::set<int> MGDataBindingImpl::applyChangesAndGetDirtyIndices(
    std::pair<int, int> windowIndexRange) {
  std::shared_ptr retainedDI = di.lock();
  if (retainedDI == nullptr) {
    return std::set<int>();
  }

  auto &rt = WishlistJsRuntime::getInstance().getRuntime();
  jsi::Object global = rt.global().getPropertyAsObject(rt, "global");
  if (!global.hasProperty(rt, "wishlists")) {
    global.setProperty(rt, "wishlists", jsi::Object(rt));
  }

  jsi::Object wishlists = global.getPropertyAsObject(rt, "wishlists");
  jsi::Object obj = wishlists.getPropertyAsObject(rt, _wishlistId.c_str());
  jsi::Value val = obj.getProperty(rt, "listener");
  if (val.isObject()) {
    jsi::Function f = val.getObject(rt).getFunction(rt);
    jsi::Array dirtyIndices = f.call(
                                   rt,
                                   jsi::Value(rt, windowIndexRange.first),
                                   jsi::Value(rt, windowIndexRange.second))
                                  .asObject(rt)
                                  .asArray(rt);
    std::set<int> res;
    for (int i = 0; i < dirtyIndices.size(rt); ++i) {
      int dirtyIndex = dirtyIndices.getValueAtIndex(rt, i).asNumber();
      res.insert(dirtyIndex);
    }
    return res;
  }
  return std::set<int>();
}

void MGDataBindingImpl::registerBindings() {
  auto &rt = WishlistJsRuntime::getInstance().getRuntime();
  jsi::Object global = rt.global().getPropertyAsObject(rt, "global");
  if (!global.hasProperty(rt, "wishlists")) {
    global.setProperty(rt, "wishlists", jsi::Object(rt));
  }

  jsi::Object wishlists = global.getPropertyAsObject(rt, "wishlists");

  jsi::Object binding(rt);
  if (wishlists.getProperty(rt, _wishlistId.c_str()).isObject()) {
    binding = wishlists.getProperty(rt, _wishlistId.c_str()).asObject(rt);
  }
  std::weak_ptr<MGDI> weakDi = di;
  binding.setProperty(
      rt,
      "scheduleSyncUp",
      jsi::Function::createFromHostFunction(
          rt,
          jsi::PropNameID::forAscii(rt, "scheduleSyncUp"),
          1,
          [=](jsi::Runtime &rt,
              const jsi::Value &thisValue,
              const jsi::Value *args,
              size_t count) -> jsi::Value {
            std::shared_ptr<MGDI> retainedDI = weakDi.lock();
            if (retainedDI == nullptr) {
              return jsi::Value::undefined();
            }
            std::shared_ptr<MGVSyncRequester> vsr =
                retainedDI->getVSyncRequester();
            vsr->requestVSync();
            return jsi::Value::undefined();
          }));

  wishlists.setProperty(rt, _wishlistId.c_str(), binding);
}

void MGDataBindingImpl::unregisterBindings() {
  auto &rt = WishlistJsRuntime::getInstance().getRuntime();
  jsi::Object global = rt.global().getPropertyAsObject(rt, "global");
  jsi::Object wishlists = global.getPropertyAsObject(rt, "wishlists");
  wishlists.setProperty(rt, _wishlistId.c_str(), jsi::Value::undefined());
}

MGDataBindingImpl::~MGDataBindingImpl() {
  unregisterBindings();
}
