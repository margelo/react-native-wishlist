import React, { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { createRunInJsFn, Wishlist } from 'react-native-wishlist';
import { AssetItem } from './AssetItem';
import { AssetListHeader } from './AssetListHeader';
import { AssetListSeparator } from './AssetListSeparator';

import assetsData, { AssetItemType } from './assets';
import { Header } from './Header';

type WithTypeAndKey<TType extends String, T> = T & { type: TType; key: string };

type AssetListItemType = WithTypeAndKey<'asset', AssetItemType>;

const tokens: AssetListItemType[] = assetsData.map((item) => ({
  ...item,
  type: 'asset',
  key: String(item.id),
}));

type AssetListState = {
  isEditing: boolean;
  isSelected: boolean;
  isExpanded: boolean;
};

export type AssetListItemWithState = AssetListItemType & AssetListState;

export type AssetListSeparatorWithState = {
  type: 'asset-list-separator';
  key: string;
} & AssetListState;

type ListItemsType =
  | AssetListItemWithState
  | AssetListSeparatorWithState
  | ({ type: 'asset-list-header'; key: string } & AssetListState);

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

  const handleExpandWorklet = createRunInJsFn(handleExpand);

  const handleEditWorklet = createRunInJsFn(handleEdit);

  const showItemAlert = createRunInJsFn((address: string) => {
    Alert.alert(address);
  });

  const toggleSelectedItem = createRunInJsFn((item: ListItemsType) => {
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
  });

  const handleItemPress = (item: AssetListItemWithState) => {
    'worklet';

    if (item.isEditing) {
      toggleSelectedItem(item);
    } else {
      showItemAlert(item.address!);
    }
  };

  return (
    <View style={styles.container}>
      <Header />

      <Wishlist.Component
        initialData={list}
        style={styles.listContainer}
        initialIndex={0}
      >
        <Wishlist.Template type="asset-list-header">
          <AssetListHeader />
        </Wishlist.Template>
        <Wishlist.Template type="asset-list-separator">
          <AssetListSeparator
            onEdit={handleEditWorklet}
            onExpand={handleExpandWorklet}
          />
        </Wishlist.Template>
        <Wishlist.Template type="asset">
          <AssetItem onItemPress={handleItemPress} />
        </Wishlist.Template>
      </Wishlist.Component>
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
