import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from './Button';
import { useTemplateValue, Wishlist } from 'wishlist';
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

  const onPin = () => {
    'worklet';
  };
  const onHide = () => {
    'worklet';
  };

  return (
    <View style={styles.container}>
      <Wishlist.Switch value={isEditing}>
        <Wishlist.Case value={true}>
          <View style={styles.buttonGroup}>
            <Button disabled onPress={onPin} text="Pin" active={false} />
            <View style={styles.margin} />
            <Button disabled onPress={onHide} text="Hide" active={false} />
          </View>
        </Wishlist.Case>

        <Wishlist.Case value={false}>
          <Button active={false} text={expandButtonText} onPress={onExpand} />
        </Wishlist.Case>
      </Wishlist.Switch>

      <Wishlist.IF condition={isExpanded}>
        <Button text={editButtonText} onPress={onEdit} active={false} />
      </Wishlist.IF>
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
