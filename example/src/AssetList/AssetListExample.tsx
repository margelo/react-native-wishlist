import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useWorkletCallback } from 'react-native-reanimated';
import { WishList } from 'wishlist';
import { AssetItem } from './AssetItem';
import { AssetListHeader } from './AssetListHeader';
import { AssetListSeparator } from './AssetListSeparator';

import data, { AssetItemType } from './assets';
import { Header } from './Header';
type WithType<TType extends String, T> = T & { type: TType };

type AssetListItemType = WithType<'asset', AssetItemType>;

const tokens: AssetListItemType[] = data.map((item) => ({
  ...item,
  type: 'asset',
}));

type ListItemsType =
  | AssetListItemType
  | { type: 'asset-list-separator' }
  | { type: 'asset-list-header' };

export const AssetListExample: React.FC<{}> = () => {
  const [isEditing, setIsEditing] = useState(false);
  // Change this line to false show less by default
  const [isExpanded, setIsExpanded] = useState(true);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEdit = useCallback(() => {
    setIsEditing((v) => !v);
  }, []);

  const handleExpand = useCallback(() => {
    setIsExpanded((v) => !v);
  }, []);

  const list = useMemo<ListItemsType[]>(() => {
    const arr = [{ type: 'asset-list-header' }].concat(tokens);

    const topItems = arr
      .slice(0, 6)
      .concat({ type: 'asset-list-separator' }) as ListItemsType[];

    if (!isExpanded) {
      return topItems;
    }

    return topItems.concat(arr.slice(6, arr.length) as ListItemsType[]);
  }, [isExpanded]);

  const onItemNeeded = useWorkletCallback((index) => list[index], [list]);

  return (
    <View style={styles.container}>
      <Header />

      <WishList.Component
        style={styles.listContainer}
        initialIndex={0}
        onItemNeeded={onItemNeeded}
      >
        <WishList.Template type="asset-list-header">
          <AssetListHeader />
        </WishList.Template>
        <WishList.Template type="asset-list-separator">
          <AssetListSeparator
            isEditing={isEditing}
            onExpand={handleExpand}
            isExpanded={isExpanded}
          />
        </WishList.Template>
        <WishList.Template type="asset">
          <AssetItem isEditing={isEditing} />
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
