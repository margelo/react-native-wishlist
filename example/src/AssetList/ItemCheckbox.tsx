import React from 'react';
import { processColor, StyleSheet, View } from 'react-native';
import { useTemplateValue, useWishListGlobalState, Wishlist } from 'wishlist';
import type {
  AssetListGlobalState,
  AssetListItemWithState,
} from './AssetListExample';

const blue = processColor('#1F87FF');
const gray = processColor('#ccd0d9');

export function ItemCheckbox() {
  const id = useTemplateValue((item: AssetListItemWithState) => {
    console.log('TV - id', item.id);
    return item.id;
  });
  const checked = useWishListGlobalState<AssetListGlobalState>((state) => {
    'worklet';

    return state.selectedItems[id.value()];
  });

  const borderColor = useTemplateValue(
    () => (checked.value() ? blue : gray) as any as string,
  );

  return (
    <View style={styles.container}>
      <Wishlist.View style={[styles.outerCircle, { borderColor }]}>
        <Wishlist.IF condition={checked}>
          <View style={styles.innerCircle} />
        </Wishlist.IF>
      </Wishlist.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 19,
    marginRight: 12,
  },
  checked: {
    borderColor: '#1F87FF',
  },
  outerCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    // borderColor: '#ccd0d9',
    borderWidth: 2,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1F87FF',
  },
});
