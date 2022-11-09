import React from 'react';
import { processColor, StyleSheet, View } from 'react-native';
import { useTemplateValue, Wishlist } from 'wishlist';
import { AssetIcon } from './AssetIcon';
import type { AssetListItemWithState } from './AssetListExample';
import type { AssetItemType } from './assets';
import { ItemCheckbox } from './ItemCheckbox';

const green = processColor('#00D146');
const gray = processColor('#9DA0A8');

function AssetInfo() {
  const name = useTemplateValue((item: AssetItemType) => item.name);
  const balance = useTemplateValue((item: AssetItemType) => item.balance);
  const nativeBalance = useTemplateValue(
    (item: AssetItemType) => `${item.nativeBalance} ${item.symbol}`,
  );
  const change = useTemplateValue((item: AssetItemType) =>
    item.change ? `${item.change}%` : '-',
  );

  const changeColor = useTemplateValue(
    (item: AssetItemType) =>
      (item.change && parseFloat(item.change) > 0
        ? green
        : gray) as any as string,
  );

  return (
    <View style={styles.container}>
      <AssetIcon />

      <View style={styles.content}>
        <View style={styles.row}>
          <Wishlist.Text style={styles.name}>{name}</Wishlist.Text>
          <Wishlist.Text style={styles.balance}>{balance}</Wishlist.Text>
        </View>
        <View style={[styles.row, styles.bottom]}>
          <Wishlist.Text style={styles.nativeBalance}>
            {nativeBalance}
          </Wishlist.Text>
          <Wishlist.Text style={[styles.change, { color: changeColor }]}>
            {change}
          </Wishlist.Text>
        </View>
      </View>
    </View>
  );
}

type AssetItemProps = {
  onItemPress: (item: AssetListItemWithState) => void;
};

export function AssetItem({ onItemPress }: AssetItemProps) {
  const isEditing = useTemplateValue(
    (item: AssetListItemWithState) => item.isEditing,
  );

  const paddingLeft = useTemplateValue((item: AssetListItemWithState) =>
    item.isEditing ? 0 : 10,
  );

  return (
    <Wishlist.Pressable onPress={onItemPress} nativeId="asset-pressable">
      <Wishlist.View style={[styles.rootContainer, { paddingLeft }]}>
        <Wishlist.IF condition={isEditing}>
          <ItemCheckbox />
        </Wishlist.IF>

        <AssetInfo />
      </Wishlist.View>
    </Wishlist.Pressable>
  );
}

const styles = StyleSheet.create({
  name: {
    fontSize: 16,
  },
  balance: {
    textAlign: 'right',
    fontSize: 16,
  },
  nativeBalance: {
    fontSize: 14,
    color: '#9DA0A8',
  },
  change: {
    textAlign: 'right',
    fontSize: 14,
  },

  container: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: 19,
    overflow: 'visible',
    paddingLeft: 9,
  },
  bottom: {
    marginTop: 2,
  },

  icon: {
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  content: {
    flex: 1,
    marginBottom: 1,
    marginLeft: 10,
  },
  rootContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    overflow: 'visible',
  },
  row: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
});
