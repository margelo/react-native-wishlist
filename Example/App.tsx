import React, {useCallback, useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {ChatListView} from './Chat/ChatList';
import {ChatItem, fetchData} from './Chat/Data';

export default function App() {
  const [data, setData] = useState<ChatItem[]>(() => []);
  // console.log('@@@@ Render APP');
  const handleLikeItem = useCallback(
    (item: ChatItem) => {
      const index = data?.findIndex(i => i.id === item.id);
      if (index > -1) {
        setData(p => [
          ...p.slice(0, index),
          {...item, likes: item.likes === 0 ? 1 : 0},
          ...p.slice(index + 1, p.length),
        ]);
      }
    },
    [data],
  );

  // Load data
  useEffect(() => {
    setData(fetchData(200));
  }, []);

  return (
    <View style={styles.container}>
      <ChatListView
        style={styles.list}
        data={data}
        onLikeItem={handleLikeItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  list: {flex: 1},
});
