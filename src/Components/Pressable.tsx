import React, { forwardRef } from 'react';
import { NativeModules, View, ViewProps } from 'react-native';
import { createTemplateComponent } from '../createTemplateComponent';
import { useTemplateCallback } from '../EventHandler';
import { getUIInflatorRegistry } from '../InflatorRepository';
import { createRunInJsFn } from '../WishlistJsRuntime';

// TODO(janic): Figure out why those cannot be imported directly from RNGH in the example app.
const ActionType = {
  REANIMATED_WORKLET: 1,
  NATIVE_ANIMATED_EVENT: 2,
  JS_FUNCTION_OLD_API: 3,
  JS_FUNCTION_NEW_API: 4,
  DIRECT_EVENT: 5,
} as const;

type ActionTypeT = (typeof ActionType)[keyof typeof ActionType];

type RNGestureHandlerModuleProps = {
  handleSetJSResponder: (tag: number, blockNativeResponder: boolean) => void;
  handleClearJSResponder: () => void;
  createGestureHandler: (
    handlerName: string,
    handlerTag: number,
    config: Readonly<Record<string, unknown>>,
  ) => void;
  attachGestureHandler: (
    handlerTag: number,
    newView: number,
    actionType: ActionTypeT,
  ) => void;
  updateGestureHandler: (
    handlerTag: number,
    newConfig: Readonly<Record<string, unknown>>,
  ) => void;
  dropGestureHandler: (handlerTag: number) => void;
  install: () => void;
  flushOperations: () => void;
};

let _handlerTag = 1000;

export function getNextHandlerTag(): number {
  return _handlerTag++;
}

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

const attachGestureHandler = createRunInJsFn((tag: number) => {
  const handlerTag = getNextHandlerTag();
  RNGestureHandlerModule.createGestureHandler(
    'TapGestureHandler',
    handlerTag,
    {},
  );
  RNGestureHandlerModule.attachGestureHandler(
    handlerTag,
    tag,
    ActionType.DIRECT_EVENT,
  );
  RNGestureHandlerModule.flushOperations();
});

const PressableView = createTemplateComponent(View, {
  addProps: (item, props) => {
    'worklet';

    const tag = item.getTag();
    item.addProps(props);

    getUIInflatorRegistry().addPushChildrenCallback(() => {
      attachGestureHandler(tag);
    });
  },
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
