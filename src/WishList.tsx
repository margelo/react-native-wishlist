import React, { useEffect, useCallback, useRef } from 'react';
import { View, Dimensions } from 'react-native';
import NativeWishList from './NativeComponent';
import InflatorRepository from './InflatorRepository';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function createWishList() {
  const componentsRegistry = new Map<string, React.ReactElement>();
  componentsRegistry.set("__offsetComponent", (
    <View style={{height: 0, width: SCREEN_WIDTH}}/>
  ));

  function WishList(props) {
    const { inflateItem } = props;
    const inflatorId = useRef(null);

    const reaRt = global._WORKLET_RUNTIME;

    if (inflatorId.current == null) {
      inflatorId.current = Math.random().toString();
      InflatorRepository.register(inflatorId.current, inflateItem);
    }

    useEffect(() => (() => {
      InflatorRepository.unregister(inflatorId.current);
    }), []);
    
    return (
      <NativeWishList  {...props} removeClippedSubviews={false} inflatorId={inflatorId.current} kkk={6} names={Array.from(componentsRegistry.keys())} reanimatedRuntime={reaRt}>
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