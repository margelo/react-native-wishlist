import { useWishlistId } from './WishlistIdContext';

export function useMarkItemsDirty() {
  const wishlistId = useWishlistId();
  return (items) => {
    'worklet';
    const markItemsDirty = global.wishlists[wishlistId].markItemsDirty;
    return markItemsDirty(items);
  };
}
