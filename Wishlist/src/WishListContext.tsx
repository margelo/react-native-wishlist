import {createContext, useContext} from 'react';

export const WishListContext = createContext<{inflatorId: string} | null>(null);

export function useWishListContext() {
  const context = useContext(WishListContext);
  if (!context) {
    throw Error('Must be rendered inside a Template component.');
  }
  return context;
}
