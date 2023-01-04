import React from 'react';
import type { ViewProps } from 'react-native';
import { WishList } from 'wishlist';
import { ChatItemView } from './ChatItem';
import type { ChatItem } from './Data';

interface Props extends ViewProps {
  data: ChatItem[];
  onAddReaction: (item: ChatItem) => void;
}

export const ChatListView: React.FC<Props> = React.memo(
  ({ data, onAddReaction, style }) => {
    return (
      <WishList.Component
        style={style}
        initialIndex={data.length - 1}
        data={data}
      >
        <WishList.Template type="me">
          <ChatItemView onAddReaction={onAddReaction} type="me" />
        </WishList.Template>
        <WishList.Template type="other">
          <ChatItemView onAddReaction={onAddReaction} type="other" />
        </WishList.Template>
      </WishList.Component>
    );
  },
);
