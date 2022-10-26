import React, { forwardRef } from 'react';
import { View } from 'react-native';
import { createTemplateComponent } from './createTemplateComponent';
import { useTemplateCallback } from './EventHandler';

type PressableProps = {
  onPress: () => void;
};

const TemplateView = createTemplateComponent(View);

export const Pressable = forwardRef<PressableProps, any>((props, ref) => {
  const onPress = useTemplateCallback(props.onPress);

  return (
    <TemplateView
      {...props}
      pointerEvents="box-only"
      onTouchEnd={onPress}
      ref={ref}
    />
  );
});
