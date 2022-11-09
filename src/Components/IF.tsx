import React from 'react';
import { View } from 'react-native';
import { createTemplateComponent } from '../createTemplateComponent';

const IFTemplateComponent = createTemplateComponent(View, (item, props) => {
  'worklet';

  if (props.condition) {
    item.addProps({ display: 'flex' });
  } else {
    item.addProps({ display: 'none' });
  }
});

// TODO(terry): Fix IF props type
export function IF(props: any) {
  return <IFTemplateComponent {...props} />;
}
