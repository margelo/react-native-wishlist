import React, { forwardRef } from 'react';
import { View, ViewProps } from 'react-native';
import { createTemplateComponent } from '../createTemplateComponent';
import { useTemplateCallback } from '../EventHandler';

type PressableProps = ViewProps & {
  onPress: () => void;
};

const TemplateView = createTemplateComponent(View);

export const Pressable = forwardRef<PressableProps, any>((props, ref) => {
  const onPress = useTemplateCallback(props.onPress);

  return (
    <TemplateView
      {...props}
      onTouchEnd={onPress}
      pointerEvents="box-only"
      ref={ref}
    />
  );
});
