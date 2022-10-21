import React from 'react';
import { WishList } from 'wishlist';
import { AssetItem } from './AssetItem';

import data from './assets';

const tokens = data.map((item) => ({ ...item, type: 'asset' }));

export const AssetListExample: React.FC<{}> = () => {
  return (
    <WishList.Component
      initialIndex={0}
      onItemNeeded={(index) => {
        'worklet';
        return tokens[index];
      }}
    >
      <WishList.Template type="asset">
        <AssetItem />
      </WishList.Template>
    </WishList.Component>
  );
};
