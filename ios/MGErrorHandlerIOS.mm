#import "MGErrorHandlerIOS.h"

#import <React/RCTLog.h>

namespace Wishlist {

void MGErrorHandlerIOS::reportError(const std::string &message)
{
  RCTLogError(@"%@", @(message.c_str()));
}

}; // namespace Wishlist
