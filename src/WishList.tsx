import React from 'react';
import { Text } from 'react-native';
import NativeWishList from './NativeComponent';


export default function createWishList() {
  const componentsRegistry = new Map<string, React.ReactElement>();

  function WishList(props) {
    return (
      <NativeWishList>
        { Array.from(componentsRegistry.values())}
      </NativeWishList>
    );
  }

  return {
    Component: WishList,
    registerComponent: (name: string, component: React.ReactElement) => {
      componentsRegistry.set(name, component);
    }
  }
}