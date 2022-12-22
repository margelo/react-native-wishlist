import { useMemo } from 'react';
import { scheduleSyncUp, ViewportObserver } from './OrchestratorBinding';
import { useGeneratedId } from './Utils';
import { useWishlistContext } from './WishlistContext';

export type Item = {
  key: string;
};

export type UpdateJob<T extends Item, ResT> = (datacopy: DataCopy<T>) => ResT;
export interface DataCopy<T extends Item> {
  getIndex: (key: string) => number | undefined;
  deque: Array<T>;
  at: (index: number) => T | undefined;
  length: () => number;
  set: (key: string, value: T) => void;
  setItem: (key: string, value: T) => void;
  get: (key: string) => T | undefined;
  forKey: (key: string) => T | undefined;
  setAt: (index: number, value: T) => void;
  push: (value: T) => void;
  unshift: (value: T) => void;
  applyChanges: (pendingUpdates: Array<UpdateJob<T, any>>) => Set<string>;
  isTrackingChanges: boolean;
  dirtyKeys: Set<string>;
}

export interface WishlistData<T extends Item> {
  update: <ResT>(job: UpdateJob<T, ResT>) => Promise<ResT>;
  at: (index: number) => T | undefined;
  length: () => number;
  forKey: (key: string) => T | undefined;
}

export interface WishlistDataInternal<T extends Item> extends WishlistData<T> {
  __attach: (wishlistId: string) => void;
  __detach: (wishlistId: string) => void;
}

export function useWishlistData<T extends Item>(
  initialData: Array<T>,
): () => WishlistData<T> {
  const dataId = useGeneratedId();
  const data = useMemo((): (() => WishlistDataInternal<T>) => {
    return () => {
      'worklet';

      if (!global.dataCtx) {
        global.dataCtx = {};
      }

      if (global.dataCtx[dataId]) {
        return global.dataCtx[dataId] as WishlistDataInternal<T>;
      }

      function createItemsDataStructure(initialData: Array<T>) {
        // classes doesn't work :(
        // TODO it can be implmented so that all ops are O(log n)
        const thiz: DataCopy<T> = {
          deque: initialData,
          getIndex: function getIndex(key: string) {
            // That's linear but can be log n (only for testing)
            for (let i = 0; i < this.deque.length; ++i) {
              if (this.deque[i].key === key) {
                return i;
              }
            }
            return undefined;
          },
          at: function at(index: number) {
            if (index == null || index >= this.length() || index < 0) {
              return undefined;
            }

            return this.deque[index];
          },
          length: function length() {
            return this.deque.length;
          },
          forKey: function forKey(key: string) {
            const index = this.getIndex(key);
            if (!index) {
              return undefined;
            }
            return this.at(index);
          },
          get: function get(key: string) {
            return this.forKey(key);
          },
          setItem: function setItem(key: string, value: T) {
            const index = this.getIndex(key);
            this.setAt(index!, value);
          },
          set: function set(key: string, value: T) {
            return this.setItem(key, value);
          },
          setAt: function setAt(index: number, value: T) {
            this.deque[index] = value;
            if (this.isTrackingChanges) {
              this.dirtyKeys.add(value.key);
            }
          },
          push: function push(value: T) {
            this.deque.push(value);
          },
          unshift: function unshift(value: T) {
            this.deque.unshift(value);
          },
          applyChanges: function applyChanges(pendingUpdates) {
            this.isTrackingChanges = true;
            for (let updateJob of pendingUpdates) {
              updateJob(this);
            }
            this.isTrackingChanges = false;
            const res = this.dirtyKeys;
            this.dirtyKeys = new Set();
            return res;
          },
          dirtyKeys: new Set<string>(),
          isTrackingChanges: false,
        };

        return thiz;
      }

      function deepClone<ObjT>(x: ObjT): ObjT {
        if ((x as any).map != null) {
          return (x as any).map((ele: unknown) => deepClone(ele));
        }

        if (typeof x === 'object') {
          const res: any = {};
          for (let key of Object.keys(x as any)) {
            res[key] = deepClone((x as any)[key]);
          }
          return res;
        }
        return x;
      }

      const initialDataCopy__next = deepClone(initialData);
      const initialDataCopy__cur = deepClone(initialData);
      const nextCopy = createItemsDataStructure(initialDataCopy__next);
      const currentlyRenderedCopy =
        createItemsDataStructure(initialDataCopy__cur);
      const attachedListIds = new Set<string>();
      const pendingUpdates: Array<UpdateJob<T, unknown>> = [];

      async function update<ResT>(updateJob: UpdateJob<T, ResT>) {
        return new Promise<ResT>((resolve) => {
          updateJob(nextCopy);
          pendingUpdates.push((dataCopy: DataCopy<T>) => {
            const result = updateJob(dataCopy);
            resolve(result);
          });
          for (const id of attachedListIds) {
            scheduleSyncUp(id);
          }
        });
      }

      function at(index: number) {
        return currentlyRenderedCopy.at(index);
      }

      function length() {
        return currentlyRenderedCopy.length();
      }

      function forKey(key: string) {
        return currentlyRenderedCopy.forKey(key);
      }

      function __attach(wishlistId: string) {
        attachedListIds.add(wishlistId);

        if (!global.wishlists) {
          global.wishlists = {};
        }
        if (!global.wishlists[wishlistId]) {
          global.wishlists[wishlistId] = {};
        }
        global.wishlists[wishlistId].listener = (
          viewportObserver: ViewportObserver,
        ) => {
          const pendingUpdatesCopy = pendingUpdates.splice(
            0,
            pendingUpdates.length,
          );

          const dirty = currentlyRenderedCopy.applyChanges(pendingUpdatesCopy);
          const window = viewportObserver.getAllVisibleItems();

          // Right now we only support adding items but it can be easily extended
          const newIndex = currentlyRenderedCopy.getIndex(window[0].key);
          viewportObserver.updateIndices(newIndex!);

          const dirtyItems = [];
          let i = 0;
          for (let item of window) {
            if (dirty.has(item.key)) {
              dirtyItems.push(i);
            }
            i++;
          }
          viewportObserver.markItemsDirty(dirtyItems);
        };
      }

      function __detach(wishlistId: string) {
        global.wishlists[wishlistId].listener = undefined;
      }

      const internalData: WishlistDataInternal<T> = {
        update,
        at,
        forKey,
        length,
        __attach,
        __detach,
      };

      global.dataCtx[dataId] = internalData;

      return internalData;
    };
  }, [initialData, scheduleSyncUp, wishlistId]);

  return data;
}

export function useData<T extends Item>() {
  const { data } = useWishlistContext();
  return data as () => WishlistData<T>;
}
