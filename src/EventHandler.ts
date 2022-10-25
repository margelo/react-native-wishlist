import { useTemplateValue } from './TemplateValue';

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

      global.handleEvent = (type: any, tag: any) => {
        const callback = global.handlers[tag.toString() + type];
        if (callback) {
          callback();
        }
      };
    })();
  }
};

export function useTemplateCallback(
  worklet: (value: any, rootValue: any) => unknown,
) {
  const value = useTemplateValue(
    (value: any, rootValue: any, templateItem: any) => {
      templateItem.addProps({ pointerEvents: 'box-only' });
      templateItem.setCallback('topTouchEnd', () => {
        worklet(value, rootValue);
      });

      return { pointerEvents: 'box-only' };
    },
  );

  return value;
}

export function initEventHandler() {
  maybeInit();
}
