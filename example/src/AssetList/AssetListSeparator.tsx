import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from './Button';

type AssetListSeparatorProps = {
  isExpanded: boolean;
  isEditing: boolean;
  onExpand: () => void;
};

export function AssetListSeparator({
  isExpanded,
  isEditing,
  onExpand,
}: AssetListSeparatorProps) {
  return (
    <View style={styles.container}>
      <Button
        active={false}
        text={isExpanded ? 'Less' : 'More'}
        onPress={onExpand}
      />

      {/* TODO: Replace with IF */}
      {isExpanded && (
        <Button
          text={isEditing ? 'Done' : 'Edit'}
          active={isEditing}
          onPress={onExpand}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 19,
    paddingVertical: 5,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.4,
    textAlign: 'left',
  },
  balance: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 0.4,
    textAlign: 'right',
  },
});
