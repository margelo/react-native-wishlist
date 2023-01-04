import React from 'react';
import { StyleSheet, View } from 'react-native';

export function ItemCheckbox() {
  const checked = false;

  return (
    <View style={styles.container}>
      <View style={[styles.outerCircle, checked && styles.checked]}>
        {checked && <View style={styles.innerCircle} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 19,
    marginRight: 12,
  },
  checked: {
    borderColor: '#1F87FF',
  },
  outerCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderColor: '#ccd0d9',
    borderWidth: 2,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1F87FF',
  },
});
