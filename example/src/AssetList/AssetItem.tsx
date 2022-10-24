import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTemplateValue, WishList } from 'wishlist';
import { AssetIcon } from './AssetIcon';
import type { AssetItemType } from './assets';
import { ItemCheckbox } from './ItemCheckbox';

function AssetInfo() {
  const name = useTemplateValue((item: AssetItemType) => item.name);
  const balance = useTemplateValue((item: AssetItemType) => item.balance);
  const nativeBalance = useTemplateValue(
    (item: AssetItemType) => `${item.nativeBalance} ${item.symbol}`,
  );
  const change = useTemplateValue((item: AssetItemType) =>
    item.change ? `${item.change}%` : '-',
  );

  // TODO(terry): Why no color?
  const changeColor = useTemplateValue((item: AssetItemType) =>
    item.change && parseFloat(item.change) > 0 ? '#00D146' : '#9DA0A8',
  );

  return (
    <View style={styles.container}>
      <AssetIcon />

      <View style={styles.content}>
        <View style={styles.row}>
          <WishList.Text style={styles.name}>{name}</WishList.Text>
          <WishList.Text style={styles.balance}>{balance}</WishList.Text>
        </View>
        <View style={[styles.row, styles.bottom]}>
          <WishList.Text style={styles.nativeBalance}>
            {nativeBalance}
          </WishList.Text>
          <WishList.Text style={[styles.change, { color: changeColor }]}>
            {change}
          </WishList.Text>
        </View>
      </View>
    </View>
  );
}

type AssetItemProps = {
  isEditing: boolean;
};

export function AssetItem({ isEditing }: AssetItemProps) {
  return (
    <View style={[styles.rootContainer, !isEditing && styles.nonEditMode]}>
      {isEditing && <ItemCheckbox />}

      <AssetInfo />
    </View>
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
  nonEditMode: {
    paddingLeft: 10,
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
