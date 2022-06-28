/**
 * @format
 */

import { AppRegistry } from 'react-native';
import React from 'react';
import App from './App';
import {View, Text} from 'react-native';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);

/*AppRegistry.registerComponent(appName, () => () => {
  return (<View>
    <Text>sdswfwfw</Text>
  </View>)
});*/