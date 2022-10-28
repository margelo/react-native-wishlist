import React, { forwardRef } from 'react';
import { View, ViewStyle } from 'react-native';
import { createTemplateComponent } from './createTemplateComponent';
import type { TemplateValue } from './TemplateValue';

const SwitchTemplateComponent = createTemplateComponent(View);

type SwitchProps = {
  value: TemplateValue<unknown>;
  children: React.ReactElement<typeof Case>[];
  style?: ViewStyle;
};

export function Switch(props: SwitchProps) {
  const children = React.Children.map(props.children, (item) =>
    React.cloneElement(item, {
      ...item.props,
      // @ts-expect-error this is hidden property
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

type CaseProps = React.PropsWithChildren<{
  value: TemplateValue<unknown> | string | boolean | number;
  style?: ViewStyle;
}>;

export function Case(props: CaseProps) {
  return <CaseTemplateComponent {...props} />;
}
