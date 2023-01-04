import React from 'react';
import {ViewProps} from 'react-native';
import {WishList} from 'Wishlist';
import {ChatItemView} from './ChatItem';
import {ChatItem} from './Data';

interface Props extends ViewProps {
  data: ChatItem[];
}

export const ChatListView: React.FC<Props> = ({data, style}) => {
  return (
    <WishList.Component
      style={style}
      inflateItem={(index, pool) => {
        'worklet';
        if (index < 0 || index >= data.length) {
          return undefined;
        }

        const element = data[index];
        const item = pool.getComponent(element.type);

        // Update content
        const contentView = item.getByWishId('content');
        contentView.RawText.addProps({text: element.message});

        const authorView = item.getByWishId('author');
        authorView.RawText.addProps({text: element.author});

        const imageView = item.getByWishId('avatar');
        imageView.addProps({source: {uri: element.avatarUrl}});
        // imageView.setCallback('loadEnd', () => {
        //   // modify data
        //   // console.log('loadEvent' + index);
        // });

        //   const button = item.getByWishId('button');
        //   button.addProps({pointerEvents: 'box-only'});
        //   button.setCallback('touchEnd', () => {
        //     console.log('touched', index, element.message);
        //   });

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
