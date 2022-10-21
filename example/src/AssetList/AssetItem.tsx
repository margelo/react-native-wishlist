import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTemplateValue, WishList } from 'wishlist';
import type { AssetItemType } from './assets';

export function AssetItem() {
  const name = useTemplateValue((item: AssetItemType) => item.name);
  const balance = useTemplateValue((item: AssetItemType) => item.balance);
  const nativeBalance = useTemplateValue(
    (item: AssetItemType) => `${item.nativeBalance} ${item.symbol}`,
  );
  const change = useTemplateValue((item: AssetItemType) =>
    item.change ? `${item.change}%` : '-',
  );
  const uri = useTemplateValue((item: AssetItemType) => item.icon);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {/* <WishList.Image style={styles.icon} source={{ uri }} /> */}
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <WishList.Text>{name}</WishList.Text>
          <WishList.Text>{balance}</WishList.Text>
        </View>
        <View style={styles.row}>
          <WishList.Text>{nativeBalance}</WishList.Text>
          <WishList.Text>{change}</WishList.Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 80,
  },
  iconContainer: {
    width: 80,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
  row: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
});
