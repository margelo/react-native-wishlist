#include "MGDIIOS.h"

namespace Wishlist {

MGDIIOS::~MGDIIOS() {}

std::shared_ptr<MGAnimationSight> MGDIIOS::getAnimationsSight() {
  return animationSight;
}

std::shared_ptr<MGBoundingBoxObserver> MGDIIOS::getBoundingBoxObserver() {
  return boundingBoxObserver_;
}

void MGDIIOS::setAnimationsSight(const std::shared_ptr<MGAnimationSight> &as) {
  animationSight = as;
}

void MGDIIOS::setBoundingBoxObserver(
    const std::shared_ptr<MGBoundingBoxObserver> &bbo) {
  boundingBoxObserver_ = bbo;
}

}; // namespace Wishlist
