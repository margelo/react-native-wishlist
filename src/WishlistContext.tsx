import { createContext, useContext } from 'react';

export const WishlistContext = createContext<{ inflatorId: string } | null>(
  null,
);

export function useWishlistContext() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw Error('Must be rendered inside a Template component.');
  }
  return context;
}
