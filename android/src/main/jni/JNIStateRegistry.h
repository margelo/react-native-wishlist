#pragma once

#include <unordered_map>

namespace Wishlist {

class JNIStateRegistry {
 public:
  static JNIStateRegistry &getInstance();

  void *getValue(int id);
  int addValue(void *value);

 private:
  JNIStateRegistry();
  JNIStateRegistry(const JNIStateRegistry &) = delete;
  JNIStateRegistry &operator=(const JNIStateRegistry &) = delete;

  std::unordered_map<int, void *> values_;
  int idGenerator_;
};

} // namespace Wishlist
