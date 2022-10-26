import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from './Button';
import { useTemplateValue, WishList } from 'wishlist';
import { useWorkletCallback } from 'react-native-reanimated';
import type { AssetListSeparatorWithState } from './AssetListExample';

type AssetListSeparatorProps = {
  onExpand: () => void;
  onEdit: () => void;
};

export function AssetListSeparator({
  onExpand,
  onEdit,
}: AssetListSeparatorProps) {
  const isEditing = useTemplateValue(
    (item: AssetListSeparatorWithState) => item.isEditing,
  );
  const isNotEditing = useTemplateValue(
    (item: AssetListSeparatorWithState) => !item.isEditing,
  );
  const expandButtonText = useTemplateValue(
    (item: AssetListSeparatorWithState) =>
      item.isExpanded ? 'Less ↑' : 'More ↓',
  );
  const isExpanded = useTemplateValue(
    (item: AssetListSeparatorWithState) => item.isExpanded,
  );
  const editButtonText = useTemplateValue((item: AssetListSeparatorWithState) =>
    item.isEditing ? 'Done' : 'Edit',
  );

  const pinTitle = useTemplateValue(() => 'Pin');
  const hideTitle = useTemplateValue(() => 'Hide');

  const onPin = useWorkletCallback(() => {});
  const onHide = useWorkletCallback(() => {});

  return (
    <View style={styles.container}>
      <WishList.IF condition={isEditing}>
        <View style={styles.buttonGroup}>
          <Button disabled onPress={onPin} text={pinTitle} active={false} />
          <View style={styles.margin} />
          <Button disabled onPress={onHide} text={hideTitle} active={false} />
        </View>
      </WishList.IF>
      <WishList.IF condition={isNotEditing}>
        <Button active={false} text={expandButtonText} onPress={onExpand} />
      </WishList.IF>

      {/* TODO: Replace with IF */}

      <WishList.IF condition={isExpanded}>
        <Button text={editButtonText} onPress={onEdit} active={false} />
      </WishList.IF>
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
