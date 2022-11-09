import { useWishlistContext } from './WishlistContext';

export function useMarkItemsDirty() {
  const { id } = useWishlistContext();
  return (items: Array<string>) => {
    'worklet';
    const markItemsDirty = global.wishlists[id].markItemsDirty as any as (
      items: Array<string>,
    ) => void;
    return markItemsDirty(items);
  };
}
