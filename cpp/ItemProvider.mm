#include "ItemProvider.hpp"
#include <react/renderer/uimanager/UIManager.h>
#include <react/renderer/uimanager/primitives.h>
#include <chrono>
#include <iostream>

struct

    WishItem
    WorkletItemProvider::provide(int index)
{
        auto start = std::chrono::high_resolution_clock::now();
  WishItem wishItem;

  jsi::Runtime &rt = *ReanimatedRuntimeHandler::rtPtr;

  jsi::Function inflateItem = rt.global()
                                  .getPropertyAsObject(rt, "global")
                                  .getPropertyAsObject(rt, "InflatorRegistry")
                                  .getPropertyAsFunction(rt, "inflateItem");

  jsi::Value returnedValue =
      inflateItem.call(rt, jsi::String::createFromUtf8(rt, tag), jsi::Value(index), cp->prepareProxy(rt));

  if (returnedValue.isUndefined()) {
    return wishItem;
  }

  std::shared_ptr<ShadowNodeBinding> shadowNodeWrapper =
      returnedValue.asObject(rt).getHostObject<ShadowNodeBinding>(rt);

  std::shared_ptr<const ShadowNode> sn = shadowNodeWrapper->sn;
        
        auto end = std::chrono::high_resolution_clock::now();
        auto d = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
        std::cout << "ooooo provide item took: " << d.count() << std::endl;

  auto affected = std::vector<const LayoutableShadowNode *>();
  this->lc.affectedNodes = &affected;
  // better use layoutTree instead of measure (will be persistant)
  std::shared_ptr<YogaLayoutableShadowNode> ysn = std::static_pointer_cast<YogaLayoutableShadowNode>(sn->clone({}));
  facebook::react::Size sz = ysn->measure(this->lc, this->lcc);

  wishItem.sn = std::static_pointer_cast<ShadowNode>(ysn);
  wishItem.height = sz.height;
  wishItem.index = index;
  wishItem.key = shadowNodeWrapper->key;
        std::cout << "ooo inflateItem " << wishItem.key << std::endl;
        auto end2 =  std::chrono::high_resolution_clock::now();
        auto dd2 = std::chrono::duration_cast<std::chrono::microseconds>(end2 - start);
        std::cout << "ooooo with measure took: " << dd2.count() << " withKey " << wishItem.key << std::endl;
        std::cout << "ooo vsync inflateItem " << std::endl;
        return wishItem;
}
