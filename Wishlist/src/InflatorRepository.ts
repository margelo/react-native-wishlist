import React from "react";

const runOnUI = (...args) => {
  const f = require("react-native-reanimated").runOnUI; //delay reanimated init
  return f(...args);
};

let done = false;
const maybeInit = () => {
  if (!done) {
    done = true;
    runOnUI(() => {
      "worklet";

      const registry = new Map();
      const mappings = new Map<string, Map<string, any>>();

      global.InflatorRegistry = {
        inflateItem: (id, index, pool) => {
          const inflator = registry.get(id);
          if (inflator) {
            const result = registry.get(id)(index, pool);
            if (!result) {
              return result;
            }
            const [item, value] = result;
            
            return global.InflatorRegistry.useMappings(item, value, value.type, id, pool);
          } else {
            console.log("Inflator not found for id: " + id);
            return undefined;
          }
        },
        useMappings: (item, value, templateType,  id, pool) => {
          console.log('value mappings', value);
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
          console.log("InflatorRegistry::register", id);
          registry.set(id, inflateMethod);
        },
        unregisterInflator: (id) => {
          console.log("InflatorRegistry::unregister", id); // TODO(Szymon) It should be done on UI Thread as it may be still in use
          registry.delete(id);
          mappings.delete(id);
        },
        registerMapping: (inflatorId: string, nativeId: string, templateType: string, inflateMethod) => {
          console.log("InflatorRegistry::registerMapping", inflatorId, nativeId, templateType, inflateMethod);
          const mapping = mappings.get(inflatorId) ?? new Map();
          const innerMapping = mapping.get(templateType) ?? new Map();
          innerMapping.set(nativeId, inflateMethod);
          mapping.set(templateType, innerMapping);
          mappings.set(inflatorId, mapping);
        },
      };

      console.log("InflatorRegister initialized");
    })();
  }
};

export default class InflatorRepository {
  static register(id: string, inflateMethod) {
    maybeInit();
    runOnUI(() => {
      "worklet";
      global.InflatorRegistry.registerInflator(id, inflateMethod);
    })();
  }

  static unregister(id: string) {
    maybeInit();
    runOnUI(() => {
      "worklet";
      global.InflatorRegistry.unregisterInflator(id);
    })();
  }

  static registerMapping(inflatorId: string, nativeId: string, templateType: string, inflateMethod) {
    maybeInit();
    runOnUI(() => {
      "worklet";
      global.InflatorRegistry.registerMapping(inflatorId, nativeId, templateType, inflateMethod);
    })();
  }
}
