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

      global.InflatorRegistry = {
        inflateItem: (id, index, pool) => {
          const inflator = registry.get(id);
          if (inflator) return registry.get(id)(index, pool);
          else {
            console.log("Inflator not found for id: " + id);
            return undefined;
          }
        },
        registerInflator: (id, inflateMethod) => {
          console.log("InflatorRegistry::register", id);
          registry.set(id, inflateMethod);
        },
        unregisterInflator: (id) => {
          console.log("InflatorRegistry::unregister", id); // TODO(Szymon) It should be done on UI Thread as it may be still in use
          registry.delete(id);
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
}
