//
//  MGTemplateContainerComponent.m
//  MGWishList
//
//  Created by Szymon on 29/08/2022.
//

#import "MGTemplateContainerComponent.h"
#import "MGContainerComponentDescriptors.h"

@implementation MGTemplateContainerComponent {
    std::vector<std::shared_ptr<facebook::react::ShadowNode const>> _templates;
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

-(std::vector<std::shared_ptr<facebook::react::ShadowNode const>>) getTemplates
{
    return _templates;
}

@end
