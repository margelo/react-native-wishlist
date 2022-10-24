import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WishList } from 'wishlist';
import { AssetItem } from './AssetItem';
import { AssetListHeader } from './AssetListHeader';

import data, { AssetItemType } from './assets';
import { Header } from './Header';

const tokens: Array<AssetItemType | { type: 'list-header' }> = data.map(
  (item) => ({
    ...item,
    type: 'asset',
  }),
);
tokens.unshift({ type: 'list-header' });

export const AssetListExample: React.FC<{}> = () => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = useCallback(() => {
    setIsEditing((v) => !v);
  }, []);

  return (
    <View style={styles.container}>
      <Header onEditPress={handleEdit} isEditing={isEditing} />

      <WishList.Component
        style={styles.listContainer}
        initialIndex={0}
        onItemNeeded={(index) => {
          'worklet';
          return tokens[index];
        }}
      >
        <WishList.Template type="list-header">
          <AssetListHeader />
        </WishList.Template>
        <WishList.Template type="asset">
          <AssetItem />
        </WishList.Template>
      </WishList.Component>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
});
