#import "MGOrchestrator.h"

#include <set>
#include "MGDIImpl.hpp"
#include "MGDataBindingImpl.hpp"
#include "MGErrorHandlerIOS.h"
#include "MGOrchestratorCppAdapter.hpp"
#include "MGUIScheduleriOS.hpp"
#include "MGViewportCarerImpl.h"
#include "WishlistJsRuntime.h"

using namespace Wishlist;

@implementation MGOrchestrator {
  UIScrollView *_scrollView;
  std::shared_ptr<MGDIImpl> _di;
  std::string _inflatorId;
  std::string _wishlistId;
  MGDims _dimensions;
  CGFloat _contentOffset;
  BOOL _alreadyRendered;
  std::shared_ptr<MGOrchestratorCppAdapter> _adapter;
}

- (instancetype)initWith:(UIScrollView *)scrollView
              wishlistId:(std::string)wishlistId
           viewportCarer:(std::shared_ptr<MGViewportCarerImpl>)viewportCarer
{
  if (self = [super init]) {
    _scrollView = scrollView;
    _wishlistId = wishlistId;
    _alreadyRendered = NO;
    _di = std::make_shared<MGDIImpl>();
    auto weakDI = std::weak_ptr<MGDIImpl>(_di);
    viewportCarer->setDI(_di);
    _di->setViewportCarer(viewportCarer);

    __weak __typeof(self) weakSelf = self;
    _adapter = std::make_shared<MGOrchestratorCppAdapter>(
        [weakSelf]() { [weakSelf handleVSync]; },
        [weakSelf](std::vector<Item> items) { [weakSelf didPushChildren:std::move(items)]; },
        [weakSelf](MGDims contentSize, float contentOffset) {
          [weakSelf didChangeContentSize:contentSize contentOffset:contentOffset];
        });
    _di->setVSyncRequester(_adapter);
    _di->setDataBinding(std::make_shared<MGDataBindingImpl>(_wishlistId, weakDI));
    _di->setUIScheduler(std::make_shared<MGUIScheduleriOS>());
    _di->setErrorHandler(std::make_shared<MGErrorHandlerIOS>());

    viewportCarer->setListener(std::weak_ptr(_adapter));
  }
  return self;
}

- (void)handleVSync
{
  // TODO: These do not seem to be needed.
  auto templates = std::vector<std::shared_ptr<facebook::react::ShadowNode const>>();
  auto names = std::vector<std::string>();

  _di->getViewportCarer()->didScrollAsync(_dimensions, templates, names, _contentOffset, _inflatorId);
}

- (void)renderAsyncWithDimensions:(MGDims)dimensions
               initialContentSize:(CGFloat)initialContentSize
                     initialIndex:(NSInteger)initialIndex
                        templates:(std::vector<std::shared_ptr<facebook::react::ShadowNode const>>)templates
                            names:(std::vector<std::string>)names
                       inflatorId:(std::string)inflatorId
{
  if (!_alreadyRendered && names.size() > 0 && names.size() == templates.size()) {
    _alreadyRendered = YES;
    _dimensions = dimensions;
    _inflatorId = inflatorId;
    _contentOffset = initialContentSize / 2;
    _di->getViewportCarer()->initialRenderAsync(
        dimensions, initialContentSize, initialIndex, templates, names, inflatorId);
  } else {
    _dimensions = dimensions;
    _inflatorId = inflatorId;
    [self handleVSync];
  }
}

- (void)didScrollAsyncWithDimensions:(MGDims)dimensions
                       contentOffset:(float)contentOffset
                          inflatorId:(std::string)inflatorId
{
  _dimensions = dimensions;
  _contentOffset = contentOffset;
  _inflatorId = inflatorId;
  [self handleVSync];
}
- (void)notifyAboutNewTemplates:(std::vector<std::shared_ptr<facebook::react::ShadowNode const>>)templates
                      withNames:(std::vector<std::string>)names
                     inflatorId:(std::string)inflatorId
{
  _inflatorId = inflatorId;
  [self handleVSync];
}

- (void)scrollToItem:(int)index
{
  // TODO: Implement
}

- (void)didPushChildren:(std::vector<Item>)items
{
}

- (void)didChangeContentSize:(MGDims)contentSize contentOffset:(CGFloat)contentOffset
{
  _scrollView.contentSize = CGSizeMake(contentSize.width, contentSize.height);
  _scrollView.contentOffset = CGPointMake(0, contentOffset);
}

- (void)dealloc
{
  _scrollView = nil;
}

@end
