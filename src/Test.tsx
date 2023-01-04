import React from 'react';
import { View, Text } from 'react-native';
import createWishList from './WishList';

const WishList = createWishList();

WishList.registerComponent("type1", (
  <View>
    <Text> ergneorgergergergerg </Text>
  </View>
));

WishList.registerComponent("type2", (
  <View>
    <View style={{width:'100%', height: 100, backgroundColor: 'purple'}}>
      <Text id="" > rgeoirgjeoirgjre </Text>
    </View>
  </View>
));

export default function App() {
  return (
    <View style={{borderWidth: 4, borderColor: 'purple', flex: 1}}>
      <WishList.Component 
      inflateItem={(index, pool) => {
        'worklet'
        const item = pool.getComponent(`type${index % 2}`);
        item.text.value = "erigjo3ijgoiejgoiejgoiejroigjerg";
        item.text.backgroundColor = "yellow";
      }}
      style={{flex:1}}/>
    </View>
  );
}