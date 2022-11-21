import { useEffect, useRef } from 'react';
import { runOnUI } from 'react-native-reanimated';
import { useTemplateValue } from './TemplateValue';
import { useWishlistContext } from './WishlistContext';

export function useSetupGlobalState(
  wishListId: string,
  inflatorId: string,
  globalState?: Record<string, unknown>,
) {
  const lastInflatorId = useRef(inflatorId);

  useEffect(() => {
    if (typeof globalState === 'undefined') {
      return;
    }

    const sameInflatorId = lastInflatorId.current === inflatorId;

    if (!sameInflatorId) {
      lastInflatorId.current = inflatorId;
    }

    runOnUI(() => {
      'worklet';

      if (typeof global.wishlistsState === 'undefined') {
        global.wishlistsState = {};
      }

      const isInit = typeof global.wishlistsState[wishListId] === 'undefined';

      global.wishlistsState[wishListId] = globalState;

      if (!isInit && sameInflatorId) {
        try {
          global.wishlists[wishListId].scheduleSyncUp();
        } catch (err) {
          console.log('Errrr', err.message);
        }
      }
    })();
  }, [wishListId, globalState, inflatorId]);
}

export function useWishListGlobalState<
  T extends Record<string, unknown>,
  R extends any = any,
>(cb: (state: T) => R) {
  const { id, globalState } = useWishlistContext();

  return useTemplateValue(() => {
    const state = global.wishlistsState?.[id] as T;

    return cb(state ?? globalState);
  });
}
