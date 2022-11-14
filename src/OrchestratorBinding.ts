import { useWishlistContext } from './WishlistContext';
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

export function useScheduleSyncUp(wishlistId?: string) {
  let id = wishlistId;
  if (!wishlistId) {
    id = useWishlistContext().id;
  }
  return () => {
    'worklet';
    const scheduleSyncUp = global.wishlists[id]
      .scheduleSyncUp as any as () => void;
    return scheduleSyncUp();
  };
}

export function useOnFlushCallback(
  listener: (viewportObserver: ViewportObserver) => void,
  wishlistId?: string,
) {
  let id = wishlistId;
  if (wishlistId == null) {
    id = useWishlistContext().id;
  }

  useEffect(() => {
    runOnUI(() => {
      'worklet';
      if (!global.wishlists) {
        global.wishlists = {};
      }
      if (!global.wishlists[id]) {
        global.wishlists[id] = {};
      }
      global.wishlists[id].listener = listener;
    })();
    return () => {
      runOnUI(() => {
        'worklet';
        global.wishlists[id].listener = undefined;
      })();
    };
  }, [id, listener]);
}
