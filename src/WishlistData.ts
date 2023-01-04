import { useMemo } from 'react';
import { runOnUI } from 'react-native-reanimated';
export function useData<T>(initialArray: Array<T>) {
  return useMemo(() => {

    
    return function data() {
      'worklet';

      if (_WORKLET) { // UI

      } else { // JS
        return {
          update: function updateData(worklet) {
            runOnUI()
          },
        }
      }
    };
  }, []);
}
