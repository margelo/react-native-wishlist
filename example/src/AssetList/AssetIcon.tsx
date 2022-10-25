import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTemplateValue, WishList } from 'wishlist';
import type { AssetItemType } from './assets';

const ethIcon = require('./assets/eth.png');
// const optimismBadge = require('./assets/optimismBadge.png');

type AssetIconProps = {};

export function AssetIcon({}: AssetIconProps) {
  // TODO(terry): Figure out why local images won't work
  const iconSource = useTemplateValue((item: AssetItemType) =>
    item.network === 'ETH' ? ethIcon : { uri: item.icon },
  );

  // TODO(terry): Use local image for badge
  // const badgeUri = useTemplateValue((item: AssetItemType) =>
  //   item.network === 'ETH' ? ethIcon : item.icon,
  // );

  // TODO(terry): IF doesn't work
  // const shouldDisplayBadge = useTemplateValue(
  //   (item: AssetItemType) => !['ETH', 'ERC20'].includes(item.network),
  // );

  return (
    <View style={styles.container}>
      <WishList.Image style={styles.icon} source={iconSource} />

      {/* <WishList.IF condition={shouldDisplayBadge}> */}
      {/* <View style={styles.badgeContainer}> */}
      {/* <WishList.Image style={styles.badge} source={optimismBadge} /> */}
      {/* </View> */}
      {/* </WishList.IF> */}
    </View>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    width: 28,
    height: 28,
    // backgroundColor: 'black',
    borderRadius: 14,
    position: 'absolute',
    bottom: 10.5,
    left: -20,
  },
  container: {
    elevation: 6,
    height: 59,
    overflow: 'visible',
    paddingTop: 9,
  },
  icon: {
    borderRadius: 20,
    height: 40,
    width: 40,
  },
});
