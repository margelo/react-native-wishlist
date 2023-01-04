import React, {useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import {ChatListView} from './Chat/ChatList';
import {fetchData} from './Chat/Data';

export default function App() {
  const data = useMemo(() => fetchData(500), []);
  return (
    <View style={styles.container}>
      <ChatListView style={styles.list} data={data} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  list: {flex: 1},
});
