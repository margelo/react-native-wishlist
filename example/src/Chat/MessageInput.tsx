import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import { BorderlessButton } from 'react-native-gesture-handler';

type MessageInputProps = {
  onSend: (text: string) => void;
};

export function MessageInput({ onSend }: MessageInputProps) {
  const [value, setValue] = useState('');

  const handlePress = () => {
    onSend(value);
    setValue('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="WishList"
        style={styles.input}
        value={value}
        onChangeText={setValue}
        onSubmitEditing={handlePress}
      />
      <BorderlessButton onPress={handlePress} style={styles.button}>
        <Text style={[styles.text, !!value && styles.active]}>Send</Text>
      </BorderlessButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 100,
    paddingBottom: 40,
    paddingHorizontal: 19,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d6d6d6',
    borderRadius: 15,
    flex: 1,
    height: 35,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  button: {
    paddingLeft: 15,
    justifyContent: 'center',
    alignItems: 'center',
    height: 35,
    width: 84,
  },
  text: {
    color: '#9DA0A8',
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 18,
  },
  active: {
    color: '#1F87FF',
  },
});
