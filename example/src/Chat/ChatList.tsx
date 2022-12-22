import React, { ForwardedRef } from 'react';
import type { ViewProps } from 'react-native';
import {
  useWishlistData,
  Wishlist,
  WishListInstance,
} from 'react-native-wishlist';
import { ChatItemView } from './ChatItem';
import type { ChatItem } from './Data';

interface Props extends ViewProps {
  initialData: ChatItem[];
  onAddReaction: (item: ChatItem) => void;
}

export const ChatListView = React.memo(
  React.forwardRef(
    (
      { initialData, onAddReaction, style }: Props,
      ref: ForwardedRef<WishListInstance>,
    ) => {
      const data = useWishlistData(initialData);

      return (
        <Wishlist.Component
          style={style}
          initialIndex={initialData.length - 1}
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
