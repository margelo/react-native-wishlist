import React, { forwardRef } from 'react';
import { NativeTouchEvent, View, ViewProps } from 'react-native';
import { createTemplateComponent } from './createTemplateComponent';
import { useTemplateCallback } from './EventHandler';

type PressableProps = ViewProps & {
  onPress: (item: any, rootItem: any) => void;
};

const TemplateView = createTemplateComponent(View);

export const Pressable = forwardRef<View, PressableProps>(
  ({ onPress, ...others }, ref) => {
    const onTouchEnd = useTemplateCallback(
      (_event: NativeTouchEvent, item, rootItem) => {
        'worklet';

        onPress(item, rootItem);
      },
    );

    return (
      <TemplateView
        {...others}
        // @ts-expect-error: TODO(janic): type events from useTemplateCallback
        onTouchEnd={onTouchEnd}
        pointerEvents="box-only"
        ref={ref}
      />
    );
  },
);
