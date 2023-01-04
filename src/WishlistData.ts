import { useEffect, useMemo } from 'react';
import { runOnUI } from './Utils';
import { makeRemote } from 'react-native-reanimated/src/reanimated2/core';
import { useWishlistContext } from './WishlistContext';
import { useOnFlushCallback, useScheduleSyncUp } from './OrchestratorBinding';

export function useInternalWishlistData(wishlistId, initialData) {
  const scheduleSyncUp = useScheduleSyncUp(wishlistId);
  const ctx = makeRemote({shouldInit: true});

  const data = useMemo(() => {
    return () => {
      'worklet';
      if (ctx.shouldInit) {
        ctx.shouldInit = false;

        const internalData = {
          
        };

        ctx.internalData = internalData;
      }

      return ctx.internalData;
    }
  }, []);

  useOnFlushCallback((viewportObserver) => {
    'worklet';
    data().getRecentChanges();
  }, wishlistId);
}

export function useData() {
  const { data } = useWishlistContext();
  return data;
}
