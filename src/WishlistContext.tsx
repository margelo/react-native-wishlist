import { createContext, useContext } from 'react';

export const WishlistContext = createContext<{
  id: string;
  inflatorId: string;
  globalState?: Record<string, any>;
} | null>(null);

export function useWishlistContext() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw Error('Must be rendered inside a Template component.');
  }
  return context;
}
