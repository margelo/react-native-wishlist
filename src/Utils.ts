export const runOnUI: typeof import('react-native-reanimated')['runOnUI'] = (
  ...args
) => {
  const f = require('react-native-reanimated').runOnUI; //delay reanimated init
  return f(...args);
};

let idGenerator = 0;

export function generateId() {
  return `id_${idGenerator++}`;
}
