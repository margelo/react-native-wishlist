#include "ReanimatedRuntimeHandler.hpp"

std::shared_ptr<jsi::Runtime> ReanimatedRuntimeHandler::rtPtr = nullptr;
std::shared_ptr<reanimated::Scheduler> ReanimatedRuntimeHandler::scheduler =
    nullptr;
