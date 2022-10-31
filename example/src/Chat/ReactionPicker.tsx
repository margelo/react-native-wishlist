import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { emoticons } from './Data';

type ReactionPickerProps = {
  onPickReaction: (emoji: string) => void;
};

export function ReactionPicker({ onPickReaction }: ReactionPickerProps) {
  return (
    <View style={styles.backdrop}>
      <View style={styles.container}>
        {emoticons.map((emoji, index) => (
          <TouchableOpacity
            onPress={() => onPickReaction(emoji)}
            key={String(index)}
          >
            <Text style={styles.emoji}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 24,
  },
  emoji: {
    fontSize: 38,
    paddingHorizontal: 8,
  },
});
