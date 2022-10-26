import React from 'react';
import { processColor, StyleSheet, View } from 'react-native';
import { useTemplateValue, WishList } from 'wishlist';

const blue = processColor('#1F87FF');
const gray = processColor('#ccd0d9');

export function ItemCheckbox() {
  const checked = useTemplateValue((item) => item.isSelected);

  const borderColor = useTemplateValue((item) =>
    item.isSelected ? blue : gray,
  );

  return (
    <View style={styles.container}>
      <WishList.View style={[styles.outerCircle, { borderColor }]}>
        <WishList.IF condition={checked}>
          <View style={styles.innerCircle} />
        </WishList.IF>
      </WishList.View>
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
