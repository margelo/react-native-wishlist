const runOnUI = (...args: any[]) => {
  const f = require('react-native-reanimated').runOnUI; //delay reanimated init
  return f(...args);
};

let done = false;
const maybeInit = () => {
  if (!done) {
    done = true;
    runOnUI(() => {
      'worklet';

      const registry = new Map<string, any>();

      const dataRegistry: DataRegistry = {
        initData: (id, initialData) => {
          registry.set(id, [...initialData]);
        },
        unregisterData: (id) => {
          registry.delete(id);
        },
        registerInflator: (id, inflateMethod) => {
          console.log('InflatorRegistry::register', id);
          registry.set(id, inflateMethod);
        },
        unregisterInflator: (id) => {
          console.log('InflatorRegistry::unregister', id); // TODO(Szymon) It should be done on UI Thread as it may be still in use
          registry.delete(id);
          mappings.delete(id);
        },
        registerMapping: (
          inflatorId: string,
          nativeId: string,
          templateType: string,
          inflateMethod: MappingInflateMethod,
        ) => {
          console.log(
            'InflatorRegistry::registerMapping',
            inflatorId,
            nativeId,
            templateType,
            inflateMethod,
          );
          const mapping = mappings.get(inflatorId) ?? new Map();
          const innerMapping = mapping.get(templateType) ?? new Map();
          innerMapping.set(nativeId, inflateMethod);
          mapping.set(templateType, innerMapping);
          mappings.set(inflatorId, mapping);
        },
      };
      global.dataRegistry = dataRegistry;

      console.log('dataRegistry initialized');
    })();
  }
};

export function getDataRegistry(): DataRegistry {
  'worklet';

  return global.DataRegistry;
}

export default class WishlistDataRegistry {
  static registerData(id: string, wishlistData: WishlistData) {
    maybeInit();
    wishlistData.__inflatorIdHandler = id;
    wishlistData.__flush();
  }

  static unregisterData(id: string) {
    maybeInit();
    runOnUI(() => {
      'worklet';
      getDataRegistry().unregisterData(id);
    })();
  }

  static useData<T>(data: Array<T>) {
    maybeInit();
    const handler = { current: null };
    const updates = [];

    const res = {
      update: (worklet) => {
        if (__WO)
        if (handler.current) {
          runOnUI(() => {
            'worklet';
            getDataRegistry().scheduleUpdates(handler.current, [worklet]);
          })();
        } else {
          updates.push(worklet);
        }
      },
    };

    Object.defineProperty(res, '__inflatorIdHandler', {
      enumerable: false,
      writable: true,
    });

    Object.defineProperty(res, '__flush', {
      enumerable: false,
      writable: true,
    });

    res.__inflatorIdHandler = handler;
    res.__flush = () => {
      if (handler.current == null) {
        throw new Error(
          'data is has not been attached to any Wishlist component',
        );
      }
      const updatesCopy = [...updates];
      runOnUI(() => {
        'worklet';
        getDataRegistry().initData(handler.current, data);
        getDataRegistry().scheduleUpdates(handler.current, updatesCopy);
      })();
      updates.splice(0, updates.length);
    };
    return res;
  }
}
