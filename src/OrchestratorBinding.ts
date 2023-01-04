import { useWishlistContext } from './WishlistContext';
import { useEffect } from 'react';
import { runOnUI } from './Utils';

export function useMarkItemsDirty() {
  const { id } = useWishlistContext();
  return (items: Array<string>) => {
    'worklet';
    const markItemsDirty = global.wishlists[id].markItemsDirty as any as (
      items: Array<string>,
    ) => void;
    return markItemsDirty(items);
  };
}

export function useMarkAllItemsDirty() {
  const { id } = useWishlistContext();
  return () => {
    'worklet';
    const markAllItemsDirty = global.wishlists[id]
      .markAllItemsDirty as any as () => void;
    return markAllItemsDirty();
  };
}

export function useOnFlushCallback(listener: () => void) {
  const { id } = useWishlistContext();

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
