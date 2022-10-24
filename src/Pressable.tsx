import React, { forwardRef } from 'react';
import { View } from 'react-native';
import { useTemplateCallback } from './EventHandler';

type PressableProps = {
  onPressWorklet: () => void;
  nativeId: string;
};

export const Pressable = forwardRef<any, PressableProps>((props, ref) => {
  useTemplateCallback(props.onPressWorklet, props.nativeId);

  return <View {...props} nativeID={props.nativeId} ref={ref} />;
});
