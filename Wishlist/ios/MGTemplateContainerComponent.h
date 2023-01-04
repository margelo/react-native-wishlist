//
//  MGTemplateContainerComponent.h
//  MGWishList
//
//  Created by Szymon on 29/08/2022.
//

#import <React-RCTFabric/React/RCTViewComponentView.h>


NS_ASSUME_NONNULL_BEGIN

@interface MGTemplateContainerComponent : RCTViewComponentView

-(std::vector<std::shared_ptr<facebook::react::ShadowNode const>>) getTemplates;
-(std::vector<std::string>)getNames;

@end

NS_ASSUME_NONNULL_END
