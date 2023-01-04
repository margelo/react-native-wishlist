import React, {useCallback, useMemo} from 'react';
import {ViewProps} from 'react-native';
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
    return (...args) => {
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
        nativeId="likes"
        onInflate={(value: any, item: any) => {
          'worklet';
          value.likes > 0
            ? item.RawText.addProps({text: '♥️'})
            : item.RawText.addProps({text: '🖤'});
          value.likes === 0 && item.addProps({opacity: 0.4});
        }}
      />
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
        {(item: ChatItem) => <ChatItemView type="me" item={item} />}
      </WishList.Template>
      <WishList.Template type="other">
        {(item: ChatItem) => <ChatItemView type="other" item={item} />}
      </WishList.Template>
    </WishList.Component>
  );
};
