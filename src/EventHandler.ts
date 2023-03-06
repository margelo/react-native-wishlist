import { useMemo } from 'react';
import { createRunInWishlistFn } from './WishlistJsRuntime';

let done = false;
const maybeInit = () => {
  if (!done) {
    done = true;
    createRunInWishlistFn(() => {
      'worklet';
      global.handlers = {};

      global.handleEvent = (type: string, tag: number, event: any) => {
        // Events are prefixed with top sometimes.
        const key = tag.toString() + type.replace(/^topOn/, 'on');
        const callback = global.handlers[key];
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
