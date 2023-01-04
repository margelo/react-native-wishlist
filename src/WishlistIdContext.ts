import { createContext, useContext } from 'react';

export const WishlistIDContext = createContext<{
  id: string;
}>({ id: 'defaultId' });

export function useWishlistId() {
  const context = useContext(WishlistIDContext);
  if (!context) {
    throw Error('Must be rendered inside a Template component.');
  }
  return context.id;
}
