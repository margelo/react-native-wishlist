import { useEffect } from 'react';
import { runOnUI } from './Utils';

interface VisibleItem {
  index: number;
  key: string;
}
export interface ViewportObserver {
  markItemsDirty: (indices: Array<number>) => void;
  markAllItemsDirty: () => void;
  getAllVisibleItems: () => Array<VisibleItem>;
  updateIndices: (newIndex: number) => void;
}

export function useScheduleSyncUp(wishlistId: string) {
  return () => {
    'worklet';
    const scheduleSyncUp = global.wishlists[wishlistId]
      .scheduleSyncUp as any as () => void;

    return scheduleSyncUp();
  };
}

export function useOnFlushCallback(
  listener: (viewportObserver: ViewportObserver) => void,
  wishlistId: string,
) {

  useEffect(() => {
    runOnUI(() => {
      'worklet';
      if (!global.wishlists) {
        global.wishlists = {};
      }
      if (!global.wishlists[wishlistId]) {
        global.wishlists[wishlistId] = {};
      }
      global.wishlists[wishlistId].listener = listener;
    })();
    return () => {
      runOnUI(() => {
        'worklet';
        global.wishlists[wishlistId].listener = undefined;
      })();
    };
  }, []);
}
