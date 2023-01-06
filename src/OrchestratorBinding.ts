import { useCallback, useEffect } from 'react';
import { createRunInWishlistFn } from './WishlistJsRuntime';

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
  return useCallback(() => {
    'worklet';
    const scheduleSyncUp = global.wishlists[wishlistId]
      .scheduleSyncUp as any as () => void;

    return scheduleSyncUp();
  }, [wishlistId]);
}

export function useOnFlushCallback(
  listener: (viewportObserver: ViewportObserver) => void,
  wishlistId: string,
) {
  useEffect(() => {
    createRunInWishlistFn(() => {
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
      createRunInWishlistFn(() => {
        'worklet';
        global.wishlists[wishlistId].listener = undefined;
      })();
    };
  }, [listener, wishlistId]);
}
