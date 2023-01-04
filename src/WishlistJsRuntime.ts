import { IWorkletContext, Worklets } from 'react-native-worklets';

function getWorkletContext(): IWorkletContext {
  const ctx = global.__wishlistWorkletContext;
  if (!ctx) {
    throw new Error('Worklet context not initialized');
  }
  return ctx;
}

export function createRunInWishlistFn<T, A extends Array<unknown>>(
  fn: (...args: A) => T,
): (...args: A) => Promise<T> {
  return Worklets.createRunInContextFn(fn, getWorkletContext());
}

export function createRunInJsFn<T, A extends Array<unknown>>(
  fn: (...args: A) => T,
): (...args: A) => T {
  'worklet';

  return Worklets.createRunInJsFn(fn);
}
