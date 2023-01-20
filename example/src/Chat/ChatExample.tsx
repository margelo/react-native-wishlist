import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
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
  const [loading, setLoading] = useState(true);

  const listRef = useRef<WishListInstance | null>(null);

  const handleSend = async (text: string) => {
    const newItem = getSendedMessage(text);

    const index = await data.update((dataCopy) => {
      'worklet';

      dataCopy.push(newItem);
      return dataCopy.length() - 1;
    });
    listRef.current?.scrollToItem(index);
  };

  // Load data
  useEffect(() => {
    setTimeout(() => {
      // TODO: data replace api to update.
      setLoading(false);
    }, 500);
  }, []);

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

  if (loading) {
    return (
      <>
        <ChatHeader isLoading />
        <View style={[styles.container, styles.center]}>
          <ActivityIndicator size="small" />
        </View>
      </>
    );
  }

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
