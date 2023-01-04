import React from 'react';
import { View, Dimensions } from 'react-native';
import NativeWishList from './NativeComponent';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function createWishList() {
  const componentsRegistry = new Map<string, React.ReactElement>();
  componentsRegistry.set("__offsetComponent", (
    <View style={{height: 0, width: SCREEN_WIDTH}}/>
  ));

  function WishList(props) {
    console.log(componentsRegistry.keys())
    return (
      <NativeWishList names={Array.from(componentsRegistry.keys())} >
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