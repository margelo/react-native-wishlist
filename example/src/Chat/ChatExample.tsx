import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  createRunInJsFn,
  useWishlistData,
  WishListInstance,
} from 'react-native-wishlist';
import { ChatHeader } from './ChatHeader';
import { ChatListView } from './ChatList';
import { ChatItem, fetchData, getSendedMessage } from './Data';
import { MessageInput } from './MessageInput';
import { ReactionPicker } from './ReactionPicker';

const INITIAL_ITEMS_COUNT = 200;

export default function App() {
  const data = useWishlistData(fetchData(INITIAL_ITEMS_COUNT));

  const listRef = useRef<WishListInstance | null>(null);

  const scrollToIndex = createRunInJsFn((index: number) => {
    listRef.current?.scrollToItem(index);
  });

  const handleSend = async (text: string) => {
    const newItem = getSendedMessage(text);

    const index = await data.update((dataCopy) => {
      'worklet';

      dataCopy.push(newItem);
      return dataCopy.length() - 1;
    });
    scrollToIndex(index);
  };

  // Load data
  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     const newData = fetchData(100);
  //     createRunInWishlistFn(() => {
  //       'worklet';
  //       data().update((dataCopy) => {
  //         console.log('did update');
  //         dataCopy.replace(newData);
  //       });
  //     })();
  //   }, 5000);
  //   return () => {
  //     clearTimeout(timeout);
  //   };
  // }, [data]);

  const [activeMessageIdForReaction, setActiveMessageIdForReaction] = useState<
    string | null
  >(null);

  const showAddReactionModal = useCallback((item: ChatItem) => {
    setActiveMessageIdForReaction(item.key);
  }, []);

  const onAddReaction = createRunInJsFn(showAddReactionModal);

  const onPickReaction = (emoji: string) => {
    data.update((dataCopy) => {
      'worklet';
      const oldValue = dataCopy.get(activeMessageIdForReaction!)!;
      oldValue.reactions.push({ emoji, key: Math.random().toString() });
      dataCopy.set(activeMessageIdForReaction!, oldValue);
    });

    setActiveMessageIdForReaction(null);
  };

  // if (!data.length) {
  //   return (
  //     <>
  //       <ChatHeader isLoading />
  //       <View style={[styles.container, styles.center]}>
  //         <ActivityIndicator size="small" />
  //       </View>
  //     </>
  //   );
  // }

  return (
    <>
      <View style={styles.container}>
        <ChatHeader isLoading={false} />
        <ChatListView
          style={styles.list}
          data={data}
          intialIndex={INITIAL_ITEMS_COUNT - 1}
          onAddReaction={onAddReaction}
          ref={listRef}
        />
        <MessageInput onSend={handleSend} />
      </View>
      {activeMessageIdForReaction && (
        <ReactionPicker onPickReaction={onPickReaction} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { flex: 1 },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
