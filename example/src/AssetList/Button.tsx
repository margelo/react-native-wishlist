import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type HeaderProps = {
  onPress: () => void;
  active: boolean;
  text: string;
};

export function Button({ onPress, text, active }: HeaderProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.button, active && styles.buttonActive]}>
        <Text style={[styles.buttonText, active && styles.buttonTextActive]}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 15,
    height: 30,
    backgroundColor: '#ccd0d9',
    paddingVertical: 5,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#1F87FF',
  },
  buttonText: {
    color: '#55585c',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonTextActive: {
    color: 'white',
  },
});
