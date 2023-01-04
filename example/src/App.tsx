import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Chat from './Chat/ChatExample';
// import { AssetListExample } from './AssetList/AssetListExample';

export function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Chat />
    </GestureHandlerRootView>
  );
}
