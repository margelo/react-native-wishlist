import React, { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { runOnJS, useWorkletCallback } from 'react-native-reanimated';
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

type AssetListState = {
  isEditing: boolean;
  isSelected: boolean;
  isExpanded: boolean;
};

export type AssetListItemWithState = AssetListItemType & AssetListState;

export type AssetListSeparatorWithState = {
  type: 'asset-list-separator';
} & AssetListState;

type ListItemsType =
  | AssetListItemWithState
  | AssetListSeparatorWithState
  | ({ type: 'asset-list-header' } & AssetListState);

export const AssetListExample: React.FC<{}> = () => {
  const [isEditing, setIsEditing] = useState(false);
  // Change this line to false show less by default
  const [isExpanded, setIsExpanded] = useState(false);

  const handleEdit = useCallback(() => {
    setIsEditing((v) => !v);
  }, []);

  const handleExpand = useCallback(() => {
    setIsExpanded((v) => !v);
  }, []);

  const [data, setData] = useState<ListItemsType[]>(tokens as ListItemsType[]);

  const list = useMemo<ListItemsType[]>(() => {
    const arr = [{ type: 'asset-list-header', isExpanded }].concat(data);

    // @ts-expect-error
    const topItems = arr
      .slice(0, 6)
      .concat({
        type: 'asset-list-separator',
      })
      .map((item) => ({
        ...item,
        isEditing,
        isExpanded,
      })) as ListItemsType[];

    if (!isExpanded) {
      return topItems;
    }

    return topItems.concat(
      arr.slice(6, arr.length).map((item) => ({
        ...item,
        isEditing,
        isExpanded,
      })) as ListItemsType[],
    );
  }, [data, isExpanded, isEditing]);

  const handleExpandWorklet = useWorkletCallback(() => {
    runOnJS(handleExpand)();
  }, []);

  const handleEditWorklet = useWorkletCallback(() => {
    runOnJS(handleEdit)();
  }, []);

  const showItemAlert = (address: string) => {
    Alert.alert(address);
  };

  const toggleSelectedItem = (item: ListItemsType) => {
    setData((items) =>
      items.map((i) =>
        // @ts-expect-error
        i.id === item.id
          ? {
              ...i,
              isSelected: !item.isSelected,
            }
          : i,
      ),
    );
  };

  const handleItemPress = useWorkletCallback((item: AssetListItemWithState) => {
    if (item.isEditing) {
      runOnJS(toggleSelectedItem)(item);
    } else {
      runOnJS(showItemAlert)(item.address!);
    }
  }, []);

  return (
    <View style={styles.container}>
      <Header />

      <WishList.Component
        data={list}
        style={styles.listContainer}
        initialIndex={0}
      >
        <WishList.Template type="asset-list-header">
          <AssetListHeader />
        </WishList.Template>
        <WishList.Template type="asset-list-separator">
          <AssetListSeparator
            onEdit={handleEditWorklet}
            onExpand={handleExpandWorklet}
          />
        </WishList.Template>
        <WishList.Template type="asset">
          <AssetItem onItemPress={handleItemPress} />
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
