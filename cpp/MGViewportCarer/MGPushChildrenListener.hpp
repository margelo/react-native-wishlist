//
//  MGPushChildrenListener.hpp
//  MGWishList
//
//  Created by Szymon on 13/01/2023.
//

#ifndef MGPushChildrenListener_hpp
#define MGPushChildrenListener_hpp

#include <stdio.h>
#include <string>

struct Item {
  float offset;
  float height;
  int index;
  std::string key;
};

struct MGPushChildrenListener {
  virtual void didPushChildren(std::vector<Item> newWindow) = 0;
};

#endif /* MGPushChildrenListener_hpp */
