import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { runOnJS, useWorkletCallback } from 'react-native-reanimated';
import { ChatHeader } from './ChatHeader';
import { ChatListView } from './ChatList';
import { addSendedMessage, ChatItem, fetchData } from './Data';
import { MessageInput } from './MessageInput';
import { ReactionPicker } from './ReactionPicker';

export default function App() {
  const [data, setData] = useState<ChatItem[]>([]);

  const handleSend = useCallback(
    (text: string) => {
      setData((val) => addSendedMessage(val, text));
    },
    [setData],
  );

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
    console.log(emoji);
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
          data={data}
          onAddReaction={onAddReaction}
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
