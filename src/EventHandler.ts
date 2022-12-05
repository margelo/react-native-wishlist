import { useMemo } from 'react';
import { runOnUI } from './Utils';

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
  nativeEvent: any,
  value: any,
  rootValue: any,
) => unknown;

export class TemplateCallback {
  worklet: TemplateCallbackWorklet;
  eventName: string | undefined;

  constructor(worklet: TemplateCallbackWorklet, eventName?: string) {
    this.worklet = worklet;
    this.eventName = eventName;
  }
}

export function useTemplateCallback(
  worklet: (nativeEvent: any, value: any, rootValue: any) => unknown,
  eventName?: string,
) {
  return useMemo(() => {
    return new TemplateCallback(worklet, eventName);
  }, [worklet, eventName]);
}

export function initEventHandler() {
  maybeInit();
}
