interface VisibleItem {
  index: number;
  key: string;
}
export interface ViewportObserver {
  markItemsDirty: (indices: Array<number>) => void;
  markAllItemsDirty: () => void;
  getAllVisibleItems: () => Array<VisibleItem>;
  updateIndices: (newIndex: number) => void;
}

export function scheduleSyncUp(wishlistId: string) {
  'worklet';
  global.wishlists[wishlistId].scheduleSyncUp();
}
