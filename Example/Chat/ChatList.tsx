import React, {useCallback, useMemo} from 'react';
import {ViewProps} from 'react-native';
import {WishList} from 'Wishlist';
import {ChatItemView} from './ChatItem';
import {ChatItem} from './Data';
import {runOnJS} from 'react-native-reanimated';
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
  const Mapping = useMemo(
    () => ({
      content: (value: any, item: any) => {
        'worklet';
        item.RawText.addProps({text: value.message});
      },
      author: (value: any, item: any) => {
        'worklet';
        item.RawText.addProps({text: value.author});
      },
      avatar: (value: any, item: any) => {
        'worklet';
        item.addProps({source: {uri: value.avatarUrl}});
      },
      likes: (value: any, item: any) => {
        'worklet';
        value.likes > 0
          ? item.RawText.addProps({text: '♥️'})
          : item.RawText.addProps({text: '🖤'});
        value.likes === 0 && item.addProps({opacity: 0.4});
      },
      likeButton: (value: any, item: any) => {
        'worklet';
        item.addProps({pointerEvents: 'box-only'});
        item.setCallback('touchEnd', () => {
          runOnJS(handleLikeItem)(value);
        });
      },
    }),
    [handleLikeItem],
  );

  return (
    <WishList.Component
      style={style}
      inflateItem={(index, pool) => {
        'worklet';

        if (index < 0 || index >= data.length) {
          return undefined;
        }

        const value = data[index];
        const item = pool.getComponent(value.type);

        Object.keys(Mapping).forEach(key => {
          const templateItem = item.getByWishId(key);
          if (templateItem) {
            try {
              Mapping[key](value, templateItem);
            } catch (err) {
              console.error(err);
            }
          }
        });

        return item;
      }}>
      <WishList.Template type="me">
        <ChatItemView type="me" />
      </WishList.Template>
      <WishList.Template type="other">
        <ChatItemView type="other" />
      </WishList.Template>
    </WishList.Component>
  );
};
