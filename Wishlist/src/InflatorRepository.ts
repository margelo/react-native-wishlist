import React from 'react';

const runOnUI = (...args) => {
  const f = require('react-native-reanimated').runOnUI; //delay reanimated init
  return f(...args);
};

let done = false;
const maybeInit = () => {
  if (!done) {
    done = true;
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
    
      console.log("aaa registered");
    
    })();
  }
};


export default class InflatorRepository {
  static register(id: string, inflateMethod) {
    maybeInit();
    runOnUI(() => {
      'worklet'
      global.InflatorRegistry.registerInflator(id, inflateMethod);
    })();
  }

  static unregister(id: string) {
    maybeInit();
    runOnUI(() => {
      'worklet'
      global.InflatorRegistry.unregisterInflator(id);
    })();
  }
}