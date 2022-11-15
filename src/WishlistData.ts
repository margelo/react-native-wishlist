import { useEffect, useMemo } from 'react';
import { runOnUI } from './Utils';
import { makeRemote } from 'react-native-reanimated/src/reanimated2/core';
import { useWishlistContext } from './WishlistContext';
import { useOnFlushCallback, useScheduleSyncUp } from './OrchestratorBinding';
import Denque from 'denque';

export function useInternalWishlistData(wishlistId, initialData) {
  const scheduleSyncUp = useScheduleSyncUp(wishlistId);
  const ctx = makeRemote({shouldInit: true});

  const data = useMemo(() => {
    return () => {
      'worklet';
      if (ctx.shouldInit) {
        ctx.shouldInit = false;
        
        class ItemsDataStructure { // TODO it can be implmented so that all ops are O(log n)
          constructor(initialData) {
            this.deque = new Denque(initialData || []);
          }

          getIndex(key) { // That's linear but can be log n (only for testing)
            for (let i = 0; i < this.deque.length; ++i) {
              if (this.deque.peekAt(i).key === key) {
                return i;
              }
            }
            return undefined;
          }

          at(index) {
            return this.deque.peekAt(index);
          }

          length() {
            return this.deque.length;
          }

          forKey(key) {
            const index = this.getIndex(key);
            return this.at(index);
          }

          setItem(key, value) {
            const index = this.getIndex(key);
            this.setAt(index, value);
          }

          setAt(index, value) {
            this.deque.peekAt(index) = value;
            if (this.isTrackingChanges) {
              this.dirtyKeys.add(value.key);
            }
          }

          push(value) {
            this.deque.push(value);
          }

          unshift(value) {
            this.deque.unshift(value);
          }
          
          // That should be part of a proxy class

          dirtyKeys = new Set();
          isTrackingChanges = false;


          // TODO(Szymon) it would be better to implment that outside of the class
          applyChanges(pendingUpdates) {
            this.isTrackingChanges = true;
            for (updateJob of pendingUpdates) {
              updateJob(this);
            }
            this.isTrackingChanges = false;
            const res = this.dirtyKeys;
            this.dirtyKeys = new Set();
            return res;
          }

        }

        const __nextCopy = new ItemsDataStructure(initialData);
        const __currentlyRenderedCopy = new ItemsDataStructure(initialData);

        const pendingUpdates = [];
        function update(worklet) {
          worklet(__nextCopy);
          pendingUpdates.push(worklet);
        }

        function at(index) {
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

        ctx.internalData = internalData;
      }

      return ctx.internalData;
    }
  }, []);

  useOnFlushCallback((viewportObserver) => {
    'worklet';
    const pendingsUpdatesCopy = [...data().pendingUpdates];
    data().splice(0, data().pendingsUpdates.length);
    const dirty = data().__currentlyRenderedCopy.applyChanges(pendingsUpdatesCopy);
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
}

export function useData() {
  const { data } = useWishlistContext();
  return data;
}
