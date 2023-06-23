import type { TemplateValueUIState } from './TemplateValue';
import { createRunInWishlistFn } from './WishlistJsRuntime';

export type TemplateItem = {
  [key: string]: TemplateItem | undefined;
} & {
  key: string;
  type: string;
  getByWishId: (id: string) => TemplateItem | undefined;
  addProps: (props: any) => void;
  setCallback: (
    eventName: string,
    callback: (nativeEvent: any) => void,
  ) => void;
  describe: () => string;
  setChildren: (children: TemplateItem[]) => void;
  getTag: () => number;
};

export type ComponentPool = {
  getComponent: (id: string) => TemplateItem | undefined;
};

export type InflateMethod = (
  index: number,
  pool: ComponentPool,
  previousItem: TemplateItem | null,
) => [TemplateItem, any] | undefined;

export type MappingInflateMethod = (
  value: any,
  templateItem: TemplateItem,
  pool: ComponentPool,
  rootValue: any,
) => void;

export type UIInflatorRegistry = {
  inflateItem: (
    id: string,
    index: number,
    pool: ComponentPool,
    prevItem: TemplateItem | null,
  ) => TemplateItem | undefined;
  registerInflator: (id: string, inflateMethod: InflateMethod) => void;
  unregisterInflator: (id: string) => void;
  registerMapping: (
    inflatorId: string,
    nativeId: string,
    templateType: string,
    inflateMethod: MappingInflateMethod,
  ) => void;
  useMappings: (
    item: TemplateItem,
    value: any,
    templateType: string,
    id: string,
    pool: ComponentPool,
    rootValue: any,
  ) => TemplateItem;
  getTemplateValueState: (id: string) => TemplateValueUIState | undefined;
  setTemplateValueState: (id: string, state: TemplateValueUIState) => void;
  deleteTemplateValueState: (id: string) => void;
  getCurrentValue: () => any;
  getCurrentRootValue: () => any;
  didPushChildren: () => void;
  addPushChildrenCallback: (callback: () => void) => void;
};

let done = false;
const maybeInit = () => {
  if (!done) {
    done = true;
    createRunInWishlistFn(() => {
      'worklet';

      const registry = new Map<string, InflateMethod>();
      const mappings = new Map<
        string,
        Map<string, Map<string, MappingInflateMethod>>
      >();
      const templateValueStates = new Map<string, TemplateValueUIState>();
      let pushChildrenCallbacks: (() => void)[] = [];
      let currentValue: any;
      let currentRootValue: any;

      const InflatorRegistry: UIInflatorRegistry = {
        inflateItem: (id, index, pool, prevItem) => {
          const inflator = registry.get(id);
          if (inflator) {
            const result = inflator(index, pool, prevItem);
            if (!result) {
              return result;
            }
            const [item, value] = result;

            return getUIInflatorRegistry().useMappings(
              item,
              value,
              value.type,
              id,
              pool,
              value, // rootValue
            );
          } else {
            console.log('Inflator not found for id: ' + id);
            return undefined;
          }
        },
        useMappings: (item, value, templateType, id, pool, rootValue) => {
          // We need to save and restore current values to support things like ForEach
          // where current value can change.
          const previousValue = currentValue;
          const previousRootValue = currentRootValue;
          currentValue = value;
          currentRootValue = rootValue;
          const mapping = mappings.get(id)?.get(templateType);
          if (mapping) {
            for (const [nativeId, inflate] of mapping.entries()) {
              const templateItem = item.getByWishId(nativeId);
              if (templateItem) {
                templateValueStates.clear();
                inflate(value, templateItem, pool, rootValue);
              }
            }
          }
          currentValue = previousValue;
          currentRootValue = previousRootValue;
          return item;
        },
        registerInflator: (id, inflateMethod) => {
          registry.set(id, inflateMethod);
        },
        unregisterInflator: (id) => {
          // TODO(Szymon) It should be done on UI Thread as it may be still in use
          registry.delete(id);
          mappings.delete(id);
        },
        registerMapping: (
          inflatorId: string,
          nativeId: string,
          templateType: string,
          inflateMethod: MappingInflateMethod,
        ) => {
          const mapping = mappings.get(inflatorId) ?? new Map();
          const innerMapping = mapping.get(templateType) ?? new Map();
          innerMapping.set(nativeId, inflateMethod);
          mapping.set(templateType, innerMapping);
          mappings.set(inflatorId, mapping);
        },
        getTemplateValueState: (id) => {
          return templateValueStates.get(id);
        },
        setTemplateValueState: (id, state) => {
          templateValueStates.set(id, state);
        },
        deleteTemplateValueState: (id) => {
          templateValueStates.delete(id);
        },
        getCurrentValue: () => {
          return currentValue;
        },
        getCurrentRootValue: () => {
          return currentRootValue;
        },
        // TODO: Scope this by wishlist
        didPushChildren: () => {
          pushChildrenCallbacks.forEach((cb) => cb());
          pushChildrenCallbacks = [];
        },
        addPushChildrenCallback: (callback) => {
          pushChildrenCallbacks.push(callback);
        },
      };
      global.InflatorRegistry = InflatorRegistry;
    })();
  }
};

export function getUIInflatorRegistry(): UIInflatorRegistry {
  'worklet';

  return global.InflatorRegistry;
}

export default class InflatorRepository {
  static register(id: string, inflateMethod: InflateMethod) {
    maybeInit();
    createRunInWishlistFn(() => {
      'worklet';
      getUIInflatorRegistry().registerInflator(id, inflateMethod);
    })();
  }

  static unregister(id: string) {
    maybeInit();
    createRunInWishlistFn(() => {
      'worklet';
      getUIInflatorRegistry().unregisterInflator(id);
    })();
  }

  static registerMapping(
    inflatorId: string,
    nativeId: string,
    templateType: string,
    inflateMethod: MappingInflateMethod,
  ) {
    maybeInit();
    createRunInWishlistFn(() => {
      'worklet';
      getUIInflatorRegistry().registerMapping(
        inflatorId,
        nativeId,
        templateType,
        inflateMethod,
      );
    })();
  }
}
