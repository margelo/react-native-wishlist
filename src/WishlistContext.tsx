import { createContext, useContext } from 'react';

export const WishlistContext = createContext<{
  id: string;
  inflatorId: string;
  data: Object;
} | null>(null);

export function useWishlistContext() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw Error('Must be rendered inside a Template component.');
  }
  return context;
}
