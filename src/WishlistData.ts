import { useMemo } from 'react';
import { scheduleSyncUp, ViewportObserver } from './OrchestratorBinding';
import { useGeneratedId } from './Utils';
import { useWishlistContext } from './WishlistContext';
import { createRunInJsFn, createRunInWishlistFn } from './WishlistJsRuntime';

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
}

interface DataCopyInternal<T extends Item> extends DataCopy<T> {
  __isTrackingChanges: boolean;
  __dirtyKeys: Set<string>;
}

export interface WishlistData<T extends Item> {
  update: <ResT>(job: UpdateJob<T, ResT>) => Promise<ResT>;
}

export interface WishlistDataInternal<T extends Item> extends WishlistData<T> {
  __attach: (wishlistId: string) => void;
  __detach: (wishlistId: string) => void;
  __at: (index: number) => T | undefined;
}

/**
 * Creates an instance of Wishlist data which can be passed to Wishlist components.
 */
export function useWishlistData<T extends Item>(
  initialData: Array<T>,
): WishlistData<T> {
  const dataId = useGeneratedId();
  const getWishlistData = useMemo((): (() => WishlistDataInternal<T>) => {
    return () => {
      'worklet';

      if (!global.dataCtx) {
        global.dataCtx = {};
      }

      if (global.dataCtx[dataId]) {
        return global.dataCtx[dataId] as WishlistDataInternal<T>;
      }

      function createItemsDataStructure(initialDeque: Array<T>) {
        // classes doesn't work :(
        // TODO it can be implmented so that all ops are O(log n)
        const thiz: DataCopyInternal<T> = {
          deque: initialDeque,
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
            if (this.__isTrackingChanges) {
              this.__dirtyKeys.add(value.key);
            }
          },
          push: function push(value: T) {
            this.deque.push(value);
          },
          unshift: function unshift(value: T) {
            this.deque.unshift(value);
          },
          applyChanges: function applyChanges(pendingUpdates) {
            this.__isTrackingChanges = true;
            for (let updateJob of pendingUpdates) {
              updateJob(this);
            }
            this.__isTrackingChanges = false;
            const res = this.__dirtyKeys;
            this.__dirtyKeys = new Set();
            return res;
          },
          __dirtyKeys: new Set<string>(),
          __isTrackingChanges: false,
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

      const initialDataCopy__cur = deepClone(initialData);
      const currentlyRenderedCopy =
        createItemsDataStructure(initialDataCopy__cur);
      const attachedListIds = new Set<string>();
      const pendingUpdates: Array<UpdateJob<T, unknown>> = [];

      async function update<ResT>(updateJob: UpdateJob<T, ResT>) {
        return new Promise<ResT>((resolve) => {
          pendingUpdates.push((dataCopy: DataCopy<T>) => {
            const result = updateJob(dataCopy);
            resolve(result);
          });
          for (const id of attachedListIds) {
            scheduleSyncUp(id);
          }
        });
      }

      function __at(index: number) {
        return currentlyRenderedCopy.at(index);
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
          if (newIndex == null) {
            // TODO: throw?
            return;
          }
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
        __at,
        __attach,
        __detach,
      };

      global.dataCtx[dataId] = internalData;

      return internalData;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return useMemo(
    () => ({
      update: <ResT>(updateJob: UpdateJob<T, ResT>) => {
        'worklet';

        // This can be called from both JS and Wishlist context.
        // TODO: Better api to check which JS runtime we are on.
        if (global.dataCtx) {
          return getWishlistData().update(updateJob);
        } else {
          return new Promise<ResT>((resolve) => {
            const resolveJs = createRunInJsFn(resolve);
            return createRunInWishlistFn(() => {
              'worklet';

              getWishlistData().update(updateJob).then(resolveJs);
            })();
          });
        }
      },
      __at(index: number) {
        'worklet';

        return getWishlistData().__at(index);
      },
      __attach: (wishlistId: string) => {
        createRunInWishlistFn(() => {
          'worklet';
          getWishlistData().__attach(wishlistId);
        })();
      },
      __detach: (wishlistId: string) => {
        createRunInWishlistFn(() => {
          'worklet';
          getWishlistData().__detach(wishlistId);
        })();
      },
    }),
    [getWishlistData],
  );
}

/**
 * Returns the data for the current Wishlist. Must be called inside template components.
 */
export function useWishlistContextData<T extends Item>() {
  const { data } = useWishlistContext();
  return data as WishlistData<T>;
}
