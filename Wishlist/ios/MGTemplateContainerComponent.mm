//
//  MGTemplateContainerComponent.m
//  MGWishList
//
//  Created by Szymon on 29/08/2022.
//

#import "MGTemplateContainerComponent.h"
#import "MGContainerComponentDescriptors.h"
#import "MGContainerProps.h"

using namespace facebook::react;

@implementation MGTemplateContainerComponent {
    std::vector<std::shared_ptr<facebook::react::ShadowNode const>> _templates;
    std::vector<std::string> _names;
}

/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect {
    // Drawing code
}
*/

#pragma mark - RCTComponentViewProtocol

+ (facebook::react::ComponentDescriptorProvider)componentDescriptorProvider
{
    return facebook::react::concreteComponentDescriptorProvider<facebook::react::MGTemplateContainerComponentComponentDescriptor>();
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<const MGTemplateContainerComponentProps>(props);
    _names = newProps.names;
    _templates = newProps.templates;
}

-(std::vector<std::shared_ptr<facebook::react::ShadowNode const>>)getTemplates
{
    return _templates;
}

-(std::vector<std::string>)getNames
{
    return _names;
}

@end
