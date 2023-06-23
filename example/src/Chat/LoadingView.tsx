import { View, ActivityIndicator, StyleSheet } from 'react-native';
import React from 'react';

export function LoadingView() {
  return (
    <View style={styles.container}>
      <ActivityIndicator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
});
