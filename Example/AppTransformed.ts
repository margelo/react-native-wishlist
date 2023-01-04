/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import { Wishlist } from 'react-native-wishlist';

type TypeAware = {
  type: string;
  [x: string | number | symbol]: unknown;
}

type WishlistData = Array<TypeAware> & {size: () => number};

const Items: WishlistItemType = [
  {
    type: 'me',
    content: 'Hey man!',
  },
  {
    type: 'someone',
    nick: 'Margelo',
    content: 'Hey!',
  },
  {
    type: 'someone',
    nick: 'Margelo',
    content: "What's up!",
  },
  {
    type: 'me',
    content: 'We really need super fast list for RN. Do you have one?',
  },
];

const App: () => Node = () => {

  return (
    <SafeAreaView>
      <Wishlist renderItem=((index) => {
        if (index === 0) return <Header/>
        const item = Items[index] || Items.get(index);
        if (item) {
          if (item.type === 'me') {
            return (<MyMessage data={item} />);
          } else {
            return (<SomeonesMessage data={item} />);
          }
        }
        if (1 + Items.size() === index) {
          return <Footer/>
        }
        return null;
      })/>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({

});

export default App;
