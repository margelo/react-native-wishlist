import React from 'react';
import { findNodeHandle } from 'react-native';
import { runOnUI } from 'react-native-reanimated';

runOnUI(() => {
  'worklet'

  const registry = new Map();

  global.InflatorRegistry = {
    inflateItem: (tag, index, pool) => {
      return (registry.get(tag))(index, pool);
    },
    registerInflator: (tag, inflateMethod) => {
      registry.set(tag, inflateMethod);
    },
    unregisterInflator: (tag) => {
      registry.delete(tag);
    }
  }

})();

export default class InflatorRepository {
  static register(ref: React.ElementRef<any>, inflateMethod) {
    const tag = findNodeHandle(ref);
    runOnUI(() => {
      'worklet'
      global.InflatorRegistry.registerInflator(tag, inflateMethod);
    })();
  }

  static unregister(ref: React.ElementRef<any>) {
    const tag = findNodeHandle(ref);
    runOnUI(() => {
      'worklet'
      global.InflatorRegistry.unregisterInflator(tag);
    })();
  }
}