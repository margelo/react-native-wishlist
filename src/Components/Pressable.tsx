import React, { forwardRef } from 'react';
import { View, ViewProps, NativeModules } from 'react-native';
// import { BaseButton } from 'react-native-gesture-handler';
import type { RNGestureHandlerModuleProps } from 'react-native-gesture-handler/src/RNGestureHandlerModule';
import { runOnJS } from 'react-native-reanimated';
import { createTemplateComponent } from '../createTemplateComponent';
import { useTemplateCallback } from '../EventHandler';

let _handlerTag = 1000;

export function getNextHandlerTag(): number {
  return _handlerTag++;
}

const ActionType = {
  REANIMATED_WORKLET: 1,
  NATIVE_ANIMATED_EVENT: 2,
  JS_FUNCTION_OLD_API: 3,
  JS_FUNCTION_NEW_API: 4,
} as const;

const RNGestureHandlerModule: RNGestureHandlerModuleProps =
  NativeModules.RNGestureHandlerModule;

export const State = {
  UNDETERMINED: 0,
  FAILED: 1,
  BEGAN: 2,
  CANCELLED: 3,
  ACTIVE: 4,
  END: 5,
} as const;

type PressableProps = ViewProps & {
  onPress: (item: any, rootItem: any) => void;
};

const attachGestureHandler = (tag: number) => {
  const handlerTag = getNextHandlerTag();
  RNGestureHandlerModule.createGestureHandler(
    'TapGestureHandler',
    handlerTag,
    {},
  );
  RNGestureHandlerModule.attachGestureHandler(
    handlerTag,
    tag,
    ActionType.JS_FUNCTION_OLD_API,
  );
  RNGestureHandlerModule.flushOperations();
};

const PressableView = createTemplateComponent(View, (item, props) => {
  'worklet';

  const tag = item.getTag();
  item.addProps(props);

  runOnJS(attachGestureHandler)(tag);
});

export const Pressable = forwardRef<any, PressableProps>(
  ({ onPress, ...others }, ref) => {
    const onGestureEvent = useTemplateCallback((ev, item, rootItem) => {
      'worklet';

      if (ev.state === State.ACTIVE) {
        onPress(item, rootItem);
      }
    }, 'onGestureHandlerStateChange');

    return (
      <PressableView
        {...others}
        // @ts-expect-error
        onGestureEvent={onGestureEvent}
        ref={ref}
      />
    );
  },
);
