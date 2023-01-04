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

type WishlistItemType = Array<TypeAware>;

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
      <Wishlist>
        <Header/>
        {items.map((item) => { // We can also think about more linked-list API to avoid rerenders
            if (item.type === 'me') {
              return (<MyMessage data={item} />);
            } else {
              return (<SomeonesMessage data={item} />);
            }
        })}
        <Footer/>
      </Wishlist>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({

});

export default App;
