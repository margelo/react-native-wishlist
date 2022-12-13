import { useMemo } from 'react';
import { createRunInWishlistFn } from './WishlistJsRuntime';

let done = false;
const maybeInit = () => {
  if (!done) {
    done = true;
    createRunInWishlistFn(() => {
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

export type TemplateCallbackWorklet = (value: any, rootValue: any) => unknown;

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
  worklet: (value: any, rootValue: any) => unknown,
) {
  return useMemo(() => {
    return new TemplateCallback(worklet);
  }, [worklet]);
}

export function initEventHandler() {
  maybeInit();
}
