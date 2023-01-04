import { useEffect, useMemo } from 'react';
import { runOnUI } from './Utils';
import { useWishlistContext } from './WishlistContext';
import { useOnFlushCallback, useScheduleSyncUp } from './OrchestratorBinding';

export function useInternalWishlistData(wishlistId, initialData) {
  const scheduleSyncUp = useScheduleSyncUp(wishlistId);

  const data = useMemo(() => {
    return () => {
      'worklet';
      _log('ooo data');
      if (!global.dataCtx) {
        global.dataCtx = {};
      }
      if (!global.dataCtx[wishlistId]) {
        _log('ooo need to init');
        function createItemsDataStructure(initialData) {// classes doesn't work :(
          // TODO it can be implmented so that all ops are O(log n)
          const thiz = {};

          thiz.deque = initialData;

          thiz.getIndex = function getIndex(key) {
            // That's linear but can be log n (only for testing)
            for (let i = 0; i < this.deque.length; ++i) {
              if (this.deque[i].key === key) {
                return i;
              }
            }
            return undefined;
          };

          thiz.at = function at(index) {
            _log('ooo at');
            return this.deque[index];
          };

          thiz.length = function length() {
            return this.deque.length;
          };

          thiz.forKey = function forKey(key) {
            const index = this.getIndex(key);
            return this.at(index);
          };

          thiz.setItem = function setItem(key, value) {
            const index = this.getIndex(key);
            this.setAt(index, value);
          };

          thiz.setAt = function setAt(index, value) {
            this.deque[index] = value;
            if (this.isTrackingChanges) {
              this.dirtyKeys.add(value.key);
            }
          };

          thiz.push = function push(value) {
            this.deque.push(value);
          };

          thiz.unshift = function unshift(value) {
            this.deque.unshift(value);
          };

          // That should be part of a proxy class

          thiz.dirtyKeys = new Set();
          thiz.isTrackingChanges = false;

          // TODO(Szymon) it would be better to implment that outside of the class
          thiz.applyChanges = function applyChanges(pendingUpdates) {
            this.isTrackingChanges = true;
            for (let updateJob of pendingUpdates) {
              updateJob(this);
            }
            this.isTrackingChanges = false;
            const res = this.dirtyKeys;
            this.dirtyKeys = new Set();
            return res;
          };
          return thiz;
        }

        _log('ooo created create funciton');

        const __nextCopy = createItemsDataStructure(initialData);
        const __currentlyRenderedCopy = createItemsDataStructure(initialData);

        _log('ooo created copies');

        const pendingUpdates = [];
        function update(worklet) {
          worklet(__nextCopy);
          pendingUpdates.push(worklet);
          scheduleSyncUp();
        }

        function at(index) {
          _log('ooo outer at');
          return __currentlyRenderedCopy.at(index);
        }

        function length() {
          return __currentlyRenderedCopy.length();
        }

        function forKey(key) {
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
        _log('ooo init is done');
      }

      return global.dataCtx[wishlistId];
    };
  }, []);

  useOnFlushCallback((viewportObserver) => {
    'worklet';
    _log('ooo flush callback');
    const pendingsUpdatesCopy = [...data().pendingUpdates];
    data().splice(0, data().pendingsUpdates.length);
    const dirty =
      data().__currentlyRenderedCopy.applyChanges(pendingsUpdatesCopy);
    const window = viewportObserver.getAllVisibleItems();

    // Right now we only support adding items but it can be easily extended
    const newIndex = data().__currentlyRenderedCopy.forKey(window[0].key);
    viewportObserver.updateIndices(newIndex);

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

  console.log('returning data');
  return data;
}

export function useData() {
  const { data } = useWishlistContext();
  return data;
}
