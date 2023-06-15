export type Item = {
  key: string;
};

export type UpdateJob<T extends Item, ResT> = (datacopy: DataCopy<T>) => ResT;

export interface DataCopy<T extends Item> {
  getIndex: (key: string) => number | undefined;
  deque: Array<T>;
  numberOfNegative: number;
  first: () => T | undefined;
  last: () => T | undefined;
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

export interface DataCopyInternal<T extends Item> extends DataCopy<T> {
  __isTrackingChanges: boolean;
  __dirtyKeys: Set<string>;
}

export function createItemsDataStructure<T extends Item>(
  initialDeque: Array<T>,
) {
  'worklet';
  // classes doesn't work :(
  // TODO it can be implmented so that all ops are O(log n)
  const thiz: DataCopyInternal<T> = {
    deque: initialDeque,
    numberOfNegative: 0, // allow negative indexes so that indices are constant
    first: function () {
      return this.deque[0];
    },
    last: function () {
      return this.deque[this.deque.length - 1];
    },
    getIndex: function getIndex(key: string) {
      // That's linear but can be log n (only for testing)
      for (let i = 0; i < this.deque.length; ++i) {
        if (this.deque[i].key === key) {
          return i - this.numberOfNegative;
        }
      }
      return undefined;
    },
    at: function at(indexInput: number) {
      const index = indexInput + this.numberOfNegative;
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
      if (index == null) {
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
    setAt: function setAt(indexInput: number, value: T) {
      const index = indexInput + this.numberOfNegative;
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
      this.numberOfNegative++;
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
