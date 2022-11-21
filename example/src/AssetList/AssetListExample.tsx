import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { runOnJS, useWorkletCallback } from 'react-native-reanimated';
import { Wishlist, WishListInstance } from 'wishlist';
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

  const [selectedItems, setSelectedItems] = useState<
    AssetListGlobalState['selectedItems']
  >({});

  const listRef = useRef<WishListInstance<ListItemsType>>(null);

  const list = useMemo<ListItemsType[]>(() => {
    const arr = [{ type: 'asset-list-header', key: 'asset-header-0' }].concat(
      tokens,
    ) as ListItemsType[];

    const topItems = arr.slice(0, 6).concat({
      key: 'list-separator-0',
      type: 'asset-list-separator',
    }) as ListItemsType[];

    if (!isExpanded) {
      return topItems;
    }

    return topItems.concat(arr.slice(6, arr.length) as ListItemsType[]);
  }, [isExpanded]);

  useEffect(() => {
    listRef.current?.update((data) => {
      'worklet';

      data.replaceSlow(list);
    });
  }, [list]);

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
        ref={listRef}
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
