#pragma once

#include "MGAnimationSight.hpp"
#include "MGBoundingBoxObserver.hpp"
#include "MGDIImpl.hpp"

namespace Wishlist {

class MGDIIOS : public MGDIImpl {
 public:
  std::shared_ptr<MGAnimationSight> getAnimationsSight();
  std::shared_ptr<MGBoundingBoxObserver> getBoundingBoxObserver();

  void setAnimationsSight(const std::shared_ptr<MGAnimationSight> &as);
  void setBoundingBoxObserver(
      const std::shared_ptr<MGBoundingBoxObserver> &bbo);

  virtual ~MGDIIOS();

 private:
  std::shared_ptr<MGAnimationSight> animationSight;
  std::shared_ptr<MGBoundingBoxObserver> boundingBoxObserver_;
};

}; // namespace Wishlist
