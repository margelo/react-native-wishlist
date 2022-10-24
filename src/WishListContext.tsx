import { createContext, useContext } from 'react';

export const WishListContext = createContext<{ inflatorId: string } | null>(
  null,
);

export function useWishListContext() {
  const context = useContext(WishListContext);
  if (!context) {
    return {
      inflatorId: null,
    };
  }
  return context;
}
