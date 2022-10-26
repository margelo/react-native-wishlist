import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TemplateValue, WishList } from 'wishlist';

type HeaderProps = {
  active: boolean;
  disabled?: boolean;
  text: TemplateValue<string> | string;
  onPress: () => void;
};

export function Button({ onPress, text, active, disabled }: HeaderProps) {
  return (
    <WishList.Pressable onPress={onPress}>
      <View
        style={[
          styles.button,
          active && styles.buttonActive,
          disabled && styles.disabled,
        ]}
      >
        <WishList.Text
          style={[styles.buttonText, active && styles.buttonTextActive]}
        >
          {text}
        </WishList.Text>
      </View>
    </WishList.Pressable>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.6,
  },
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
    lineHeight: 18,
  },
  buttonTextActive: {
    color: 'white',
  },
});
