import React, {useCallback, useMemo} from 'react';
import type {ViewProps} from 'react-native';
import {WishList} from 'wishlist';
import {ChatItemView} from './ChatItem';
import {ChatItem} from './Data';

interface Props extends ViewProps {
  data: ChatItem[];
  onLikeItem: (item: ChatItem) => void;
}

export const ChatListView: React.FC<Props> = ({data, onLikeItem, style}) => {
  const handleLikeItem = useCallback(
    (item: ChatItem) => {
      onLikeItem(item);
    },
    [onLikeItem],
  );

  const runOnJS = useMemo(() => {
    const f = require('react-native-reanimated').runOnJS; //delay reanimated init
    return (...args: any[]) => {
      'worklet';
      return f(...args);
    };
  }, []);

  return (
    <WishList.Component
      style={style}
      initialIndex={0}
      onItemNeeded={index => {
        'worklet';
        return data[index];
      }}>
      <WishList.Mapping
        templateType="other"
        nativeId="likeButton"
        onInflate={(value: any, item: any) => {
          'worklet';
          item.addProps({pointerEvents: 'box-only'});
          item.setCallback('topTouchEnd', () => {
            runOnJS(handleLikeItem)(value);
          });
        }}
      />
      <WishList.Template type="me">
        <ChatItemView type="me" />
      </WishList.Template>
      <WishList.Template type="other">
        <ChatItemView type="other" />
      </WishList.Template>
    </WishList.Component>
  );
};
