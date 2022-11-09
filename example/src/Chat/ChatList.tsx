import React from 'react';
import { RefreshControl, ViewProps } from 'react-native';
import { Wishlist } from 'wishlist';
import { ChatItemView } from './ChatItem';
import type { ChatItem } from './Data';

interface Props extends ViewProps {
  data: ChatItem[];
  onAddReaction: (item: ChatItem) => void;
  refreshing: boolean;
  onRefresh: () => void;
}

export const ChatListView: React.FC<Props> = React.memo(
  ({ data, onAddReaction, style, refreshing, onRefresh }) => {
    return (
      <Wishlist.Component
        style={style}
        initialIndex={data.length - 1}
        data={data}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Wishlist.Template type="me">
          <ChatItemView onAddReaction={onAddReaction} type="me" />
        </Wishlist.Template>
        <Wishlist.Template type="other">
          <ChatItemView onAddReaction={onAddReaction} type="other" />
        </Wishlist.Template>
      </Wishlist.Component>
    );
  },
);
