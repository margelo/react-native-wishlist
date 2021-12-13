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
    const ref = useRef(null);
   
    const handleRef = useCallback((compRef) => {
      if (compRef != null) {
        ref.current = compRef;
        InflatorRepository.register(compRef, inflateItem);
      }
    }, [inflateItem]);

    useEffect(() => (() => {
      if (ref.current != null) {
        InflatorRepository.unregister(ref.current);
      }
    }), []);
    
    return (
      <NativeWishList ref={handleRef} {...props}  removeClippedSubviews={false} names={Array.from(componentsRegistry.keys())} >
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