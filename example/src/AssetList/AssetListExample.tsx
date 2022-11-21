import React, { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { runOnJS, useWorkletCallback } from 'react-native-reanimated';
import { Wishlist } from 'wishlist';
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
export type AssetListHeader = { type: 'asset-list-header'; key: string };

export type AssetListSeparatorWithState = {
  type: 'asset-list-separator';
  key: string;
};

type ListItemsType =
  | AssetListItemWithState
  | AssetListSeparatorWithState
  | AssetListHeader;

export type AssetListGlobalState = {
  isEditing: boolean;
  isExpanded: boolean;
  selectedItems: { [key: string]: boolean };
};

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [data, setData] = useState<ListItemsType[]>(tokens as ListItemsType[]);
  const [selectedItems, setSelectedItems] = useState<
    AssetListGlobalState['selectedItems']
  >({});

  const list = useMemo<ListItemsType[]>(() => {
    const arr = [{ type: 'asset-list-header', key: 'asset-header-0' }].concat(
      data,
    ) as ListItemsType[];

    const topItems = arr.slice(0, 6).concat({
      key: 'list-separator-0',
      type: 'asset-list-separator',
    }) as ListItemsType[];

    if (!isExpanded) {
      return topItems;
    }

    return topItems.concat(arr.slice(6, arr.length) as ListItemsType[]);
  }, [data, isExpanded]);

  const handleExpandWorklet = useWorkletCallback(() => {
    runOnJS(handleExpand)();
  }, []);

  const handleEditWorklet = useWorkletCallback(() => {
    runOnJS(handleEdit)();
  }, []);

  const showItemAlert = (address: string) => {
    Alert.alert(address);
  };

  const toggleSelectedItem = (item: AssetListItemWithState) => {
    console.log('Change', item.id);
    setSelectedItems((v) => ({
      ...v,
      [item.id]: !v[item.id],
    }));
  };

  const handleItemPress = useWorkletCallback(
    (item: AssetListItemWithState, edit: boolean) => {
      if (edit) {
        runOnJS(toggleSelectedItem)(item);
      } else {
        runOnJS(showItemAlert)(item.address!);
      }
    },
    [isEditing],
  );

  const globalState = useMemo<AssetListGlobalState>(
    () => ({
      isEditing,
      isExpanded,
      selectedItems,
    }),
    [isEditing, isExpanded, selectedItems],
  );

  return (
    <View style={styles.container}>
      <Header />

      <Wishlist.Component
        initialData={list}
        style={styles.listContainer}
        initialIndex={0}
        globalState={globalState}
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
