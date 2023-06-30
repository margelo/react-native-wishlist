export type Item = {
  key: string;
};

export type UpdateJob<T extends Item, ResT> = (datacopy: DataCopy<T>) => ResT;

export interface DataCopy<T extends Item> {
  getIndex: (key: string) => number | undefined;
  at: (index: number) => T | undefined;
  length: number;
  setItem: (key: string, value: T) => void;
  getItem: (key: string) => T | undefined;
  removeItem: (key: string) => void;
  setAt: (index: number, value: T) => void;
  push: (value: T) => void;
  unshift: (value: T) => void;
  setItems: (items: Array<T>) => void;
}

export interface DataCopyInternal<T extends Item> extends DataCopy<T> {
  __isTrackingChanges: boolean;
  __dirtyIndexes: number[];
  __deque: Array<T>;
  __numberOfNegative: number;
  __applyChanges: (pendingUpdates: Array<UpdateJob<T, any>>) => number[];
}

export function createItemsDataStructure<T extends Item>(
  initialDeque: Array<T>,
) {
  'worklet';

  // RN worklets objects / arrays are proxies need to be deep cloned to
  // work properly in some cases. Ideally this would not be needed.
  function deepClone<ObjT>(x: ObjT): ObjT {
    if (typeof x === 'object' && x !== null) {
      // rn-worklet arrays are proxy and Array.isArray doesn't work.
      if (typeof (x as any).map === 'function') {
        return (x as any).map((ele: unknown) => deepClone(ele));
      } else {
        const res: any = {};
        for (let key of Object.keys(x as any)) {
          res[key] = deepClone((x as any)[key]);
        }
        return res;
      }
    }
    return x;
  }

  // classes doesn't work :(
  // TODO it can be implemented so that all ops are O(log n)
  const thiz: DataCopyInternal<T> = {
    getIndex: function getIndex(key: string) {
      // That's linear but can be log n (only for testing)
      for (let i = 0; i < this.__deque.length; ++i) {
        if (this.__deque[i].key === key) {
          return i - this.__numberOfNegative;
        }
      }
      return undefined;
    },
    at: function at(indexInput: number) {
      const index = indexInput + this.__numberOfNegative;
      if (index == null || index >= this.length || index < 0) {
        return undefined;
      }

      return this.__deque[index];
    },
    get length() {
      return this.__deque.length;
    },
    getItem: function get(key: string) {
      const index = this.getIndex(key);
      if (index == null) {
        return undefined;
      }
      return this.at(index);
    },
    setItem: function setItem(key: string, value: T) {
      const index = this.getIndex(key);
      if (index == null) {
        return;
      }
      this.setAt(index, value);
    },
    removeItem: function removeItem(key: string) {
      const index = this.getIndex(key);
      if (index == null) {
        return;
      }
      this.__deque.splice(index + this.__numberOfNegative, 1);
      if (index < 0) {
        this.__numberOfNegative--;
      }
      if (this.__isTrackingChanges) {
        this.__dirtyIndexes.push(index);
      }
    },
    setAt: function setAt(index: number, value: T) {
      this.__deque[index + this.__numberOfNegative] = deepClone(value);
      if (this.__isTrackingChanges) {
        this.__dirtyIndexes.push(index);
      }
    },
    push: function push(value: T) {
      this.__deque.push(deepClone(value));
    },
    unshift: function unshift(value: T) {
      this.__deque.unshift(deepClone(value));
      this.__numberOfNegative++;
    },
    setItems: function reset(items: Array<T>) {
      if (this.__isTrackingChanges) {
        this.__deque.forEach((_item, i) => this.__dirtyIndexes.push(i));
      }
      this.__deque = deepClone(items);
      this.__numberOfNegative = 0;
    },
    __applyChanges: function __applyChanges(pendingUpdates) {
      this.__isTrackingChanges = true;
      for (let updateJob of pendingUpdates) {
        updateJob(this);
      }
      this.__isTrackingChanges = false;
      const res = this.__dirtyIndexes.map((i) => i);
      this.__dirtyIndexes = [];
      return res;
    },
    __deque: deepClone(initialDeque),
    __numberOfNegative: 0, // allow negative indexes so that indices are constant
    __dirtyIndexes: [],
    __isTrackingChanges: false,
  };

  return thiz;
}
