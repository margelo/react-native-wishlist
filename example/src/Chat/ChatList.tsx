import React from 'react';
import type { ViewProps } from 'react-native';
import { Wishlist } from 'wishlist';
import { ChatItemView } from './ChatItem';
import type { ChatItem } from './Data';

interface Props extends ViewProps {
  data: ChatItem[];
  onAddReaction: (item: ChatItem) => void;
}

export const ChatListView: React.FC<Props> = React.memo(
  ({ data, onAddReaction, style }) => {
    return (
      <Wishlist.Component
        style={style}
        initialIndex={data.length - 1}
        data={data}
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
