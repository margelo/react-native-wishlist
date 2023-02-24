import { ContextType, IWorkletContext, Worklets } from 'react-native-worklets';

function getWorkletContext(): IWorkletContext {
  const ctx = global.__wishlistWorkletContext;
  if (!ctx) {
    throw new Error('Worklet context not initialized');
  }
  return ctx;
}

export function createRunInWishlistFn<
  C extends ContextType,
  T,
  A extends Array<unknown>,
>(fn: (this: C, ...args: A) => T): (...args: A) => Promise<T> {
  return Worklets.createRunInContextFn(fn, getWorkletContext());
}

export const createRunInJsFn = Worklets.createRunInJsFn;
