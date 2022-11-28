import React, { useCallback, useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { runOnJS, useWorkletCallback } from 'react-native-reanimated';
import type { WishListInstance } from 'wishlist';
import { ChatHeader } from './ChatHeader';
import { ChatListView } from './ChatList';
import {
  addSendedMessage,
  ChatItem,
  fetchData,
  getSendedMessage,
} from './Data';
import { MessageInput } from './MessageInput';
import { ReactionPicker } from './ReactionPicker';

export default function App() {
  const [data, setData] = useState<ChatItem[]>([]);

  const listRef = useRef<WishListInstance<ChatItem>>();

  const handleSend = useCallback(async (text: string) => {
    const newItem = getSendedMessage(text);
    const index = (await listRef.current?.update((dataCopy) => {
      'worklet';
      // get rid of frozen object that Reanimated creates
      const val = JSON.parse(JSON.stringify(newItem));
      dataCopy.push(val);
      return dataCopy.length() - 1;
    })) as number;
    listRef.current?.scrollToItem(index);
  }, []);

  // Load data
  useEffect(() => {
    setTimeout(() => {
      setData(fetchData(200));
    }, 500);
  }, []);

  const [activeMessageForReaction, setActiveReactionPicker] =
    useState<ChatItem | null>(null);

  const showAddReactionModal = useCallback((item: ChatItem) => {
    setActiveReactionPicker(item);
  }, []);

  const onAddReaction = useWorkletCallback((item: ChatItem) => {
    runOnJS(showAddReactionModal)(item);
  });

  const onPickReaction = (emoji: string) => {
    setActiveReactionPicker(null);
  };

  if (!data.length) {
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
          initialData={data}
          onAddReaction={onAddReaction}
          ref={listRef}
        />
        <MessageInput onSend={handleSend} />
      </View>
      {activeMessageForReaction && (
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
