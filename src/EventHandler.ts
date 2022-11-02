import { useMemo } from 'react';

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

      global.handleEvent = (type: string, tag: number, event: any) => {
        const callback = global.handlers[tag.toString() + type];
        if (callback) {
          callback(event);
        }
      };
    })();
  }
};

export type TemplateCallbackWorklet = (
  event: any,
  value: any,
  rootValue: any,
) => unknown;

export class TemplateCallback {
  _worklet: TemplateCallbackWorklet;

  constructor(worklet: TemplateCallbackWorklet) {
    this._worklet = worklet;
  }

  getWorklet() {
    return this._worklet;
  }
}

export function useTemplateCallback(
  worklet: (nativeEvent: any, value: any, rootValue: any) => unknown,
) {
  return useMemo(() => {
    return new TemplateCallback(worklet);
  }, [worklet]);
}

export function initEventHandler() {
  maybeInit();
}
