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
      <Text> rgeoirgjeoirgjre </Text>
    </View>
  </View>
));

export default function App() {
  return (
    <View>
      <WishList.Component/>
    </View>
  );
}