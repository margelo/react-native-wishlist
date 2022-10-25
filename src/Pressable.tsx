import React, { forwardRef } from 'react';
import { View } from 'react-native';
import { createTemplateComponent } from './createTemplateComponent';
import { useTemplateCallback } from './EventHandler';

type PressableProps = {
  onPress: () => void;
  nativeId: string;
};

const TemplateView = createTemplateComponent(View);

export const Pressable = forwardRef<PressableProps, any>((props, ref) => {
  const value = useTemplateCallback(props.onPress);

  return (
    <TemplateView xyz={value} {...props} nativeID={props.nativeId} ref={ref} />
  );
});
