import React from 'react';
import type { ViewProps } from 'react-native';
import { runOnJS, useWorkletCallback } from 'react-native-reanimated';
import { WishList } from 'wishlist';
import { ChatItemView } from './ChatItem';
import type { ChatItem } from './Data';

interface Props extends ViewProps {
  data: ChatItem[];
  onLikeItem: (item: ChatItem) => void;
  onAddReaction: (item: ChatItem) => void;
}

export const ChatListView: React.FC<Props> = React.memo(
  ({ data, onLikeItem, onAddReaction, style }) => {
    const handleLikeItem = useWorkletCallback((item: ChatItem) => {
      runOnJS(onLikeItem)(item);
    });

    return (
      <WishList.Component
        style={style}
        initialIndex={data.length - 1}
        data={data}
      >
        <WishList.Template type="me">
          <ChatItemView
            onAddReaction={onAddReaction}
            type="me"
            onLikeItem={handleLikeItem}
          />
        </WishList.Template>
        <WishList.Template type="other">
          <ChatItemView
            onAddReaction={onAddReaction}
            type="other"
            onLikeItem={handleLikeItem}
          />
        </WishList.Template>
      </WishList.Component>
    );
  },
);
