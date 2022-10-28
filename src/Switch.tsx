import React, { forwardRef } from 'react';
import { View } from 'react-native';
import { createTemplateComponent } from './createTemplateComponent';

const SwitchTemplateComponent = createTemplateComponent(View);

export function Switch(props: any) {
  const children = React.Children.map(props.children, (item) =>
    React.cloneElement(item, {
      ...item.props,
      switchValue: props.value,
    }),
  );

  return <SwitchTemplateComponent {...props} children={children} />;
}

export const CaseBase = forwardRef<any, any>((props, ref) => {
  return <View {...props} ref={ref} />;
});

const CaseTemplateComponent = createTemplateComponent(
  CaseBase,
  (item, props) => {
    'worklet';

    if (props.switchValue === props.value) {
      item.addProps({ display: 'flex' });
    } else {
      item.addProps({ display: 'none' });
    }
  },
);

export function Case(props: any) {
  return <CaseTemplateComponent {...props} />;
}
