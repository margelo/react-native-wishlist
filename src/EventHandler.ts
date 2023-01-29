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
        console.log('handleEvent', type, tag, event);
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
