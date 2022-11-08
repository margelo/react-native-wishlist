import { useWishlistId } from './WishlistIdContext';

export function useMarkItemsDirty() {
  const wishlistId = useWishlistId();
  return (items: Array<string>) => {
    'worklet';
    const markItemsDirty = global.wishlists[wishlistId]
      .markItemsDirty as any as (items: Array<string>) => void;
    return markItemsDirty(items);
  };
}
