export type TemplateItem = {
  [key: string]: TemplateItem | undefined;
} & {
  getByWishId: (id: string) => TemplateItem | undefined;
  addProps: (props: any) => void;
  addCallback: (callback: () => void) => void;
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
  ) => TemplateItem;
};

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

      const registry = new Map<string, InflateMethod>();
      const mappings = new Map<
        string,
        Map<string, Map<string, MappingInflateMethod>>
      >();

      const InflatorRegistry: UIInflatorRegistry = {
        inflateItem: (id, index, pool) => {
          const inflator = registry.get(id);
          if (inflator) {
            const result = inflator(index, pool);
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
            );
          } else {
            console.log('Inflator not found for id: ' + id);
            return undefined;
          }
        },
        useMappings: (item, value, templateType, id, pool) => {
          // console.log('value mappings', value);
          const mapping = mappings.get(id)?.get(templateType);
          if (mapping) {
            for (const [nativeId, inflate] of mapping.entries()) {
              const templateItem = item.getByWishId(nativeId);
              if (templateItem) {
                inflate(value, templateItem, pool);
              }
            }
          }
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
