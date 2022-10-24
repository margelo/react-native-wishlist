import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type HeaderProps = {
  onEditPress: () => void;
  isEditing: boolean;
};

export function Header({ onEditPress, isEditing }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.avatar} />

      <TouchableOpacity onPress={onEditPress} activeOpacity={0.8}>
        <View style={[styles.button, isEditing && styles.buttonActive]}>
          <Text
            style={[styles.buttonText, isEditing && styles.buttonTextActive]}
          >
            {isEditing ? 'Done' : 'Edit'}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 108,
    paddingTop: 58,
    paddingHorizontal: 19,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#9DA0A8',
  },
  button: {
    borderRadius: 15,
    height: 30,
    backgroundColor: '#9DA0A8',
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
