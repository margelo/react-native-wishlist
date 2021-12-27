import React from 'react';
import { findNodeHandle } from 'react-native';
import { runOnUI } from 'react-native-reanimated';

runOnUI(() => {
  'worklet'

  const registry = new Map();

  global.InflatorRegistry = {
    inflateItem: (id, index, pool) => {
      return (registry.get(id))(index, pool);
    },
    registerInflator: (id, inflateMethod) => {
      registry.set(id, inflateMethod);
    },
    unregisterInflator: (id) => {
      registry.delete(id);
    }
  }

})();

export default class InflatorRepository {
  static register(id: string, inflateMethod) {
    runOnUI(() => {
      'worklet'
      global.InflatorRegistry.registerInflator(id, inflateMethod);
    })();
  }

  static unregister(id: string) {
    runOnUI(() => {
      'worklet'
      global.InflatorRegistry.unregisterInflator(id);
    })();
  }
}