import React, { forwardRef } from 'react';
import { View } from 'react-native';
import { useTemplateCallback } from './EventHandler';

type PressableProps = {
  onPress: () => void;
  nativeId: string;
};

export const Pressable = forwardRef<PressableProps, any>((props, ref) => {
  useTemplateCallback(props.onPress, props.nativeId);

  return <View {...props} nativeID={props.nativeId} ref={ref} />;
});
