import React, { forwardRef } from 'react';
import { View } from 'react-native';

// This needs to be split to avoid circular dependency.

export const ForEachBase = forwardRef<any, any>((props, ref) => {
  return <View {...props} ref={ref} />;
});
