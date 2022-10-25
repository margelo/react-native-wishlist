import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from './Button';
import { useTemplateValue } from 'wishlist';
import { useWorkletCallback } from 'react-native-reanimated';

type AssetListSeparatorProps = {
  isExpanded: boolean;
  isEditing: boolean;
  onExpand: () => void;
};

type AssetListSeparatorType = {
  type: 'asset-list-separator';
  isExpanded: boolean;
  isEditing: boolean;
};

export function AssetListSeparator({ isEditing, onExpand }: AssetListSeparatorProps) {
  const expandButtonText = useTemplateValue((item: AssetListSeparatorType) =>
    item.isExpanded ? 'Less ↑' : 'More ↓',
  );
  const editButtonText = useTemplateValue((item: AssetListSeparatorType) =>
    item.isEditing ? 'Done' : 'Edit',
  );

  const onPin = useWorkletCallback(() => {});
  const onHide = useWorkletCallback(() => {});
  const onEdit = useWorkletCallback(() => {});

  return (
    <View style={styles.container}>
      {isEditing ? (
        <View style={styles.buttonGroup}>
          <Button
            nativeId="asset-list-pin"
            disabled
            onPress={onPin}
            text="Pin"
            active={false}
          />
          <View style={styles.margin} />
          <Button
            nativeId="asset-list-hide"
            disabled
            onPress={onHide}
            text="Hide"
            active={false}
          />
        </View>
      ) : (
        <Button
          active={false}
          text={expandButtonText}
          nativeId="asset-list-expand"
          onPress={onExpand}
        />
      )}

      {/* TODO: Replace with IF */}

      <Button
        nativeId="asset-list-edit"
        text={editButtonText}
        onPress={onEdit}
        active={isEditing}
      />
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
  buttonGroup: {
    flexDirection: 'row',
  },
  margin: {
    width: 8,
  },
});
