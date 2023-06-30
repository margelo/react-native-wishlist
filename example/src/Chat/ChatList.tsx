import React, { ForwardedRef } from 'react';
import type { ViewProps } from 'react-native';
import {
  Wishlist,
  WishlistData,
  WishListInstance,
} from 'react-native-wishlist';
import { ChatItemView } from './ChatItem';
import type { ChatItem } from './Data';
import { LoadingView } from './LoadingView';

interface Props extends ViewProps {
  data: WishlistData<ChatItem>;
  onAddReaction: (item: ChatItem) => void;
  intialIndex?: number;
  onStartReached?: () => void;
  onEndReached?: () => void;
}

export const ChatListView = React.memo(
  React.forwardRef(
    (
      {
        data,
        intialIndex,
        onAddReaction,
        onStartReached,
        onEndReached,
        style,
      }: Props,
      ref: ForwardedRef<WishListInstance>,
    ) => {
      return (
        <Wishlist.Component
          style={style}
          initialIndex={intialIndex}
          data={data}
          ref={ref}
          onStartReached={onStartReached}
          onEndReached={onEndReached}
        >
          <Wishlist.Template type="me">
            <ChatItemView onAddReaction={onAddReaction} type="me" />
          </Wishlist.Template>
          <Wishlist.Template type="other">
            <ChatItemView onAddReaction={onAddReaction} type="other" />
          </Wishlist.Template>
          <Wishlist.Template type="loading">
            <LoadingView />
          </Wishlist.Template>
        </Wishlist.Component>
      );
    },
  ),
);
