import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useTemplateValue, WishList as Wishlist} from 'wishlist';
import type {ChatItem, ReactionItem} from './Data';

interface Props {
  type: 'me' | 'other';
}

export const Reaction = () => {
  const emoji = useTemplateValue((item: ReactionItem) => {
    return item.emoji || 'b';
  });

  return (
    <View>
      <Wishlist.Text>{emoji}</Wishlist.Text>
    </View>
  );
};

export const ChatItemView: React.FC<Props> = ({type}) => {
  const author = useTemplateValue((item: ChatItem) => item.author);
  const avatarUrl = useTemplateValue((item: ChatItem) => item.avatarUrl);
  const message = useTemplateValue((item: ChatItem) => item.message);
  const likeText = useTemplateValue((item: ChatItem) =>
    item.likes > 0 ? '♥️' : '🖤',
  );
  const likeOpacity = useTemplateValue((item: ChatItem) =>
    item.likes > 0 ? 1 : 0.4,
  );

  const reactions = useTemplateValue((item: ChatItem) => item.reactions);

  return (
    <View style={[styles.container, type === 'me' ? styles.me : styles.other]}>
      <View style={styles.imageAndAuthor}>
        <Wishlist.Image style={styles.avatarImage} source={{uri: avatarUrl}} />
        <View style={styles.authorContainer}>
          <Wishlist.Text style={styles.authorText}>{author}</Wishlist.Text>
          {type === 'other' ? (
            <View nativeID="likeButton">
              <Wishlist.Text style={{opacity: likeOpacity}}>
                {likeText}
              </Wishlist.Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.messageContainer}>
        <Wishlist.Text style={styles.messageText}>{message}</Wishlist.Text>
      </View>

      <Wishlist.Template type="reaction">
        <Reaction />
      </Wishlist.Template>

      <Wishlist.ForEach
        style={{flexDirection: 'row'}}
        items={reactions}
        template="reaction"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
    padding: 10,
    width: '70%',
    borderRadius: 10,
  },
  me: {
    alignSelf: 'flex-end',
    backgroundColor: '#A4A5EF',
  },
  other: {
    backgroundColor: '#EFEFEF',
  },
  imageAndAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  authorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 6,
    flex: 1,
  },
  authorText: {
    fontWeight: 'bold',
  },
  messageContainer: {
    marginTop: 6,
  },
  messageText: {},
});
