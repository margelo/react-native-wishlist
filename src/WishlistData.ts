import { useMemo } from 'react';
import { scheduleSyncUp } from './OrchestratorBinding';
import { useGeneratedId } from './Utils';
import { useWishlistContext } from './WishlistContext';
import {
  createItemsDataStructure,
  DataCopy,
  Item,
  UpdateJob,
} from './WishlistDataCopy';
import { createRunInJsFn, createRunInWishlistFn } from './WishlistJsRuntime';

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

      const currentlyRenderedCopy = createItemsDataStructure(initialData);
      const attachedListIds = new Set<string>();
      const pendingUpdates: Array<UpdateJob<T, unknown>> = [];

      async function update<ResT>(updateJob: UpdateJob<T, ResT>) {
        return new Promise<ResT>((resolve) => {
          pendingUpdates.push((dataCopy: DataCopy<T>) => {
            const result = updateJob(dataCopy);
            resolve(result);
          });
          if (attachedListIds.size > 0) {
            for (const id of attachedListIds) {
              scheduleSyncUp(id);
            }
          } else {
            // If we are not rendering a list yet, just apply changes immediately.
            currentlyRenderedCopy.__applyChanges(pendingUpdates);
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
        global.wishlists[wishlistId].listener = () => {
          const pendingUpdatesCopy = pendingUpdates.splice(
            0,
            pendingUpdates.length,
          );

          return currentlyRenderedCopy.__applyChanges(pendingUpdatesCopy);
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
