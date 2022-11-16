import type { TemplateValueUIState } from './TemplateValue';
import { runOnUI } from './Utils';

export type TemplateItem = {
  [key: string]: TemplateItem | undefined;
} & {
  key: string;
  getByWishId: (id: string) => TemplateItem | undefined;
  addProps: (props: any) => void;
  setCallback: (eventName: string, callback: () => void) => void;
  describe: () => string;
  setChildren: (children: TemplateItem[]) => void;
};

export type ComponentPool = {
  getComponent: (id: string) => TemplateItem | undefined;
};

export type InflateMethod = (
  index: number,
  pool: ComponentPool,
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
};

let done = false;
const maybeInit = () => {
  if (!done) {
    done = true;
    runOnUI(() => {
      'worklet';

      const registry = new Map<string, InflateMethod>();
      const mappings = new Map<
        string,
        Map<string, Map<string, MappingInflateMethod>>
      >();
      const templateValueStates = new Map<string, TemplateValueUIState>();
      let currentValue: any;
      let currentRootValue: any;

      const InflatorRegistry: UIInflatorRegistry = {
        inflateItem: (id, index, pool) => {
          _log('inflate item ooo');
          const inflator = registry.get(id);
          _log('ooo right after registry.get');
          if (inflator) {
            _log('ooo befire inflator');
            const result = inflator(index, pool);
            _log('ooo r a inflator');
            if (!result) {
              _log('ooo no result');
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
            _log('ooo inflator not found');
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
                inflate(value, templateItem, pool, rootValue);
              }
            }
          }
          currentValue = previousValue;
          currentRootValue = previousRootValue;
          return item;
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
          console.log('registered!@');
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
      };
      global.InflatorRegistry = InflatorRegistry;

      console.log('InflatorRegister initialized');
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
    runOnUI(() => {
      'worklet';
      getUIInflatorRegistry().registerInflator(id, inflateMethod);
    })();
  }

  static unregister(id: string) {
    maybeInit();
    runOnUI(() => {
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
    runOnUI(() => {
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
