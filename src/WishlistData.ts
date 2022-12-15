import { useMemo } from 'react';
import { useOnFlushCallback, useScheduleSyncUp } from './OrchestratorBinding';
import { useWishlistContext } from './WishlistContext';
import { createRunInJsFn } from './WishlistJsRuntime';

export type Item = {
  key: string;
};

export type UpdateJob<T extends Item> = (datacopy: DataCopy<T>) => unknown;
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
  applyChanges: (pendingUpdates: Array<UpdateJob<T>>) => Set<string>;
  isTrackingChanges: boolean;
  dirtyKeys: Set<string>;
}

export interface Data<T extends Item> {
  update: (job: UpdateJob<T>, callback?: (results: unknown) => void) => void;
  at: (index: number) => T | undefined;
  length: () => number;
  forKey: (key: string) => T | undefined;
  pendingUpdates: Array<UpdateJob<T>>;
  __currentlyRenderedCopy: DataCopy<T>;
  __nextCopy: DataCopy<T>;
}

export function useInternalWishlistData<T extends Item>(
  wishlistId: string,
  initialData: Array<T>,
) {
  const scheduleSyncUp = useScheduleSyncUp(wishlistId);

  const data = useMemo(() => {
    return () => {
      'worklet';

      if (!global.dataCtx) {
        global.dataCtx = {};
      }
      if (!global.dataCtx[wishlistId]) {
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
              if (index == undefined || index >= this.length() || index < 0) {
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

        function deepClone(x: unknown): unknown {
          if (x.map != null) {
            return x.map((ele: unknown) => deepClone(ele));
          }
  
          if (typeof x === 'object') {
            const res = {};
            for (let key of Object.keys(x)) {
              res[key] = deepClone(x[key]);
            }
            return res;
          }
          return x;
        }
        const initialDataCopy__next = deepClone(initialData);
        const initialDataCopy__cur = deepClone(initialData);
        const __nextCopy = createItemsDataStructure(initialDataCopy__next);
        const __currentlyRenderedCopy = createItemsDataStructure(initialDataCopy__cur);

        const pendingUpdates: Array<UpdateJob<T>> = [];
        function update(
          updateJob: UpdateJob<T>,
          callback?: (result: any) => void,
        ) {
          updateJob(__nextCopy);
          pendingUpdates.push((dataCopy: DataCopy<T>) => {
            const result = updateJob(dataCopy);
            if (callback) {
              createRunInJsFn(callback)(result);
            }
          });
          scheduleSyncUp();
        }

        function at(index: number) {
          return __currentlyRenderedCopy.at(index);
        }

        function length() {
          return __currentlyRenderedCopy.length();
        }

        function forKey(key: string) {
          return __currentlyRenderedCopy.forKey(key);
        }

        const internalData = {
          update,
          at,
          forKey,
          length,
          __currentlyRenderedCopy,
          __nextCopy,
          pendingUpdates,
        };
        global.dataCtx[wishlistId] = internalData;
      }
      return global.dataCtx[wishlistId] as Data<T>;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useOnFlushCallback((viewportObserver) => {
    'worklet';

    _log('ooo flush');
    const pendingUpdates = data().pendingUpdates;
    const pendingUpdatesCopy = pendingUpdates.splice(0, pendingUpdates.length);

    const dirty =
      data().__currentlyRenderedCopy.applyChanges(pendingUpdatesCopy);
    const window = viewportObserver.getAllVisibleItems();

    // Right now we only support adding items but it can be easily extended
    const newIndex = data().__currentlyRenderedCopy.getIndex(window[0].key);
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
  }, wishlistId);

  return data as () => Data<T>;
}

export function useData<T extends Item>() {
  const { data } = useWishlistContext();
  return data as () => Data<T>;
}
