import React, { ForwardedRef } from 'react';
import type { ViewProps } from 'react-native';
import {
  Wishlist,
  WishlistData,
  WishListInstance,
} from 'react-native-wishlist';
import { ChatItemView } from './ChatItem';
import type { ChatItem } from './Data';

interface Props extends ViewProps {
  data: WishlistData<ChatItem>;
  onAddReaction: (item: ChatItem) => void;
  intialIndex?: number;
}

export const ChatListView = React.memo(
  React.forwardRef(
    (
      { data, intialIndex, onAddReaction, style }: Props,
      ref: ForwardedRef<WishListInstance>,
    ) => {
      return (
        <Wishlist.Component
          style={style}
          initialIndex={intialIndex}
          data={data}
          ref={ref}
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
  ),
);
