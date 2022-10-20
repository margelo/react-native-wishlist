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
      global.handlers = {};

      global.handleEvent = (type, tag) => {
        const callback = global.handlers[tag.toString() + type];
        if (callback) {
          callback();
        }
      };
    })();
  }
};

export function initEventHandler() {
  maybeInit();
}
