import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AssetListExample } from './AssetList/AssetListExample';
// import { ChatListView } from './ChatList';
// import { ChatItem, fetchData } from './Data';

export default function App() {
  // const [data, setData] = useState<ChatItem[]>([]);
  // const handleLikeItem = useCallback(
  //   (item: ChatItem) => {
  //     const index = data?.findIndex((i) => i.id === item.id);
  //     if (index > -1) {
  //       setData((p) => [
  //         ...p.slice(0, index),
  //         { ...item, likes: item.likes === 0 ? 1 : 0 },
  //         ...p.slice(index + 1, p.length),
  //       ]);
  //     }
  //   },
  //   [data],
  // );

  // // Load data
  // useEffect(() => {
  //   setData(fetchData(200));
  // }, []);

  return (
    <View style={styles.container}>
      <AssetListExample />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { flex: 1 },
});
