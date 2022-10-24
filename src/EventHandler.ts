import { useContext, useMemo } from 'react';
import { TemplateContext } from './TemplateContext';

const runOnUI = (...args: any[]) => {
  const f = require('react-native-reanimated').runOnUI; //delay reanimated init
  return f(...args);
};

let done = false;
const maybeInit = () => {
  if (!done) {
    done = true;
    runOnUI(() => {
      'worklet';
      global.handlers = {};

      global.handleEvent = (type: any, tag: any) => {
        const callback = global.handlers[tag.toString() + type];
        if (callback) {
          callback();
        }
      };
    })();
  }
};

export const CallbacksRegistry = {
  callbacks: {} as Record<string, any>,

  register({
    nativeId,
    templateType,
    onInflate,
  }: {
    nativeId: string;
    templateType: string;
    onInflate: (value: any, item: any) => void;
  }) {
    if (this.callbacks[nativeId]) {
      return;
    }

    this.callbacks[nativeId] = { templateType, onInflate };
  },
};

export function useTemplateCallback(worklet: () => unknown, nativeId: string) {
  const template = useContext(TemplateContext);
  useMemo(() => {
    CallbacksRegistry.register({
      templateType: template?.templateType!,
      nativeId,
      onInflate: (value: any, item: any) => {
        'worklet';

        item.addProps({ pointerEvents: 'box-only' });
        item.setCallback('topTouchEnd', () => {
          worklet();
        });
      },
    });
  }, [template, worklet, nativeId]);
}

export function initEventHandler() {
  maybeInit();
}
