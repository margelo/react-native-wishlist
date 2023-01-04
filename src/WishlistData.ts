import { useMemo } from 'react';
import { runOnUI } from './Utils';
import { makeRemote } from 'react-native-reanimated/src/reanimated2/core';
import { useWishlistContext } from './WishlistContext';

export function useInternalWishlistData() {
  const data = useMemo(() => {
    return makeRemote({
      
    });
  }, [])
}

export function useData() {
  const { data } = useWishlistContext();
  return data;
}
